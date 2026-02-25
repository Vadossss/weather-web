import {
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { useMapEvents, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { toast, Toaster } from "sonner";
import { MiniMap } from "./components/project/MiniMap";
import type {
  WeatherCurrent,
  WeatherHourly,
  WeatherMessage,
} from "./types/weather";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Cloudy,
  Droplets,
  Gauge,
  MousePointer2,
  Star,
  Sun,
  Wind,
} from "lucide-react";
import type { AddressResponse, FeatureMember } from "./types/address";
import { LiquidCard } from "./components/project/WeatherCardLiquidGlass";
import { Skeleton } from "./components/ui/skeleton";
import { Spinner } from "./components/ui/spinner";
import { useSearchParams } from "react-router-dom";
import { Slider } from "./components/project/Slider";
import { TemperatureChart } from "./components/project/TemperatureChart";
import { useDebounce } from "react-use";
import {
  FavoritesContext,
  FavoritesProvider,
} from "./context/FavoritesContext";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER: LatLngExpression = [55.733842, 37.588144];
const DEFAULT_ZOOM = 9;

export interface AddressResult {
  lat: string;
  lon: string;
  administrativeAreaName: string;
  localityName: string;
}

interface StateWeather {
  name: string;
  icon: ReactNode;
}

export interface DayAgg {
  date: string;
  dayMax: number | null;
  nightMax: number | null;
  weatherCode: number | null;
}

const AreaIdentify = (azimuth: number) => {
  if (azimuth >= 337.5 || azimuth < 22.5) return "С";
  if (azimuth >= 22.5 && azimuth < 67.5) return "СВ";
  if (azimuth >= 67.5 && azimuth < 112.5) return "В";
  if (azimuth >= 112.5 && azimuth < 157.5) return "ЮВ";
  if (azimuth >= 157.5 && azimuth < 202.5) return "Ю";
  if (azimuth >= 202.5 && azimuth < 247.5) return "ЮЗ";
  if (azimuth >= 247.5 && azimuth < 292.5) return "З";
  if (azimuth >= 292.5 && azimuth < 337.5) return "СЗ";

  return "—";
};

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (coords: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function SetViewOnCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

export function getWeatherType(wmoCode: number): StateWeather {
  if (wmoCode === 0)
    return {
      name: "Солнечно",
      icon: <Sun className="size-10" />,
    };

  if (wmoCode >= 1 && wmoCode <= 3)
    return {
      name: "Переменная облачность",
      icon: <CloudSun className="size-10" />,
    };

  if (wmoCode >= 4 && wmoCode <= 8)
    return {
      name: "Облачно",
      icon: <Cloud className="size-10" />,
    };

  if (wmoCode === 45 || wmoCode === 48)
    return {
      name: "Туман",
      icon: <CloudFog className="size-10" />,
    };

  if (wmoCode >= 51 && wmoCode <= 55)
    return {
      name: "Морось",
      icon: <CloudDrizzle className="size-10" />,
    };

  if (wmoCode >= 61 && wmoCode <= 65)
    return {
      name: "Дождь",
      icon: <CloudRain className="size-10" />,
    };

  if (wmoCode >= 66 && wmoCode <= 69)
    return {
      name: "Мокрый снег",
      icon: <CloudSnow className="size-10" />,
    };

  if (wmoCode >= 71 && wmoCode <= 75)
    return {
      name: "Снег",
      icon: <CloudSnow className="size-10" />,
    };

  if (wmoCode >= 80 && wmoCode <= 82)
    return {
      name: "Ливень",
      icon: <CloudRainWind className="size-10" />,
    };

  if (wmoCode >= 83 && wmoCode <= 84)
    return {
      name: "Мокрый снег",
      icon: <CloudSnow className="size-10" />,
    };

  if (wmoCode === 95)
    return {
      name: "Гроза",
      icon: <CloudLightning />,
    };

  if (wmoCode >= 96 && wmoCode <= 99)
    return {
      name: "Град",
      icon: <CloudHail />,
    };

  return {
    name: "Что-то",
    icon: <Cloud />,
  };
}

const func = (weatherData: WeatherCurrent) => {
  return [
    {
      icon: <Wind />,
      value: `${weatherData.wind_speed_10m.toFixed(0)} м/c, ${" " + AreaIdentify(weatherData.wind_direction_10m)}`,
    },
    {
      icon: <Droplets />,
      value: `${weatherData.relative_humidity_2m.toFixed(0)}%`,
    },
    {
      icon: <Cloudy />,
      value: `${weatherData.cloud_cover.toFixed(0)}%`,
    },
    {
      icon: <Gauge />,
      value: `${weatherData.pressure_msl.toFixed(0)}`,
    },
  ];
};

interface FavoritesProps {
  favorites: AddressResult[];
}

const getDayNightTempMAx = (hours: WeatherHourly[]): DayAgg[] => {
  console.log(hours);

  const byDate = new globalThis.Map<
    string,
    { day: number[]; night: number[]; weatherCode: number[] }
  >();

  for (const h of hours) {
    const d = new Date(h.time);
    const hour = d.getHours();
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    console.log(day);

    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { day: [], night: [], weatherCode: [] });
    }

    const isDay = hour > 6 && hour < 18;

    byDate.get(dateKey)!.weatherCode.push(h.weather_code);

    if (isDay) {
      byDate.get(dateKey)!.day?.push(h.temperature_2m);
    } else {
      byDate.get(dateKey)?.night.push(h.temperature_2m);
    }
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, groups]) => ({
      date,
      dayMax: groups.day.length
        ? Number(Math.max(...groups.day).toFixed(0))
        : null,
      nightMax: groups.night.length
        ? Number(Math.max(...groups.night).toFixed(0))
        : null,
      weatherCode: groups.weatherCode.length
        ? findMostFrequent(groups.weatherCode)
        : null,
    }));
};

function findMostFrequent(arr: number[]) {
  const frequency: Record<number, number> = {};
  let maxCount = 0;
  let mostFrequent = null;

  for (const num of arr) {
    frequency[num] = (frequency[num] || 0) + 1;

    if (frequency[num] > maxCount) {
      maxCount = frequency[num];
      mostFrequent = num;
    }
  }

  return mostFrequent;
}

function Map() {
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryResult, setSearchQueryResult] = useState<AddressResult[]>(
    [],
  );
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [address, setAddress] = useState<AddressResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addressData, setAddressData] = useState<AddressResponse | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    "Поиск адреса или места",
  );

  const 

  const { favorites, toggleFavorites } =
    useContext(FavoritesContext);

  const handleLocateMe = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const [lat, lon] = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter([lat, lon]);
        setMarker([lat, lon]);
        setSearchParams({
          lat: String(lat.toFixed(6)),
          lon: String(lon.toFixed(6)),
        });
      },
      (err) => console.warn("Геолокация:", err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [setMapCenter, setMarker, setSearchParams]);

  console.log(favorites);

  useEffect(() => {
    if (searchParams.size > 0) {
      setMarker([
        Number(searchParams.get("lat")),
        Number(searchParams.get("lon")),
      ]);
      setMapCenter([
        Number(searchParams.get("lat")),
        Number(searchParams.get("lon")),
      ]);
      return;
    }
    handleLocateMe();
  }, []);

  useEffect(() => {
    const handleWeatherFetch = async () => {
      if (marker === null) return;

      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/weather?latitude=${marker[0]}&longitude=${marker[1]}`,
        );
        const data = await res.json();

        setWeatherData(data);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };
    handleWeatherFetch();
  }, [marker]);

  useDebounce(
    async () => {
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `https://geocode-maps.yandex.ru/v1/?apikey=${import.meta.env.VITE_YANDEX_API_KEY}&geocode=${encodeURIComponent(searchQuery)}&format=json&lang=ru`,
        );
        const data = await res.json();

        if (res.ok) {
          setAddressData(data.response.GeoObjectCollection);
        } else {
          toast("Ошибка поиска");
        }
      } catch {
        toast("Ошибка поиска");
      } finally {
        setIsSearching(false);
      }
    },
    250,
    [searchQuery],
  );

  useEffect(() => {
    const handleSearchYandex = async () => {
      if (marker === null) return;

      try {
        const res = await fetch(
          `https://geocode-maps.yandex.ru/v1/?apikey=${import.meta.env.VITE_YANDEX_API_KEY}&geocode=${marker[1]},${marker[0]}&format=json&lang=ru`,
        );
        const data = await res.json();
        console.log(data);

        if (res.ok) {
          const features = data.response.GeoObjectCollection.featureMember;

          const priorityOrder = ["locality", "province", "street", "country"];

          let selectedGeo: FeatureMember | null = null;

          for (const kind of priorityOrder) {
            selectedGeo =
              features.find(
                (geo: FeatureMember) =>
                  geo.GeoObject.metaDataProperty.GeocoderMetaData.kind === kind,
              ) || null;

            if (selectedGeo) break;
          }

          if (!selectedGeo && features.length > 0) {
            selectedGeo = features[0];
          }

          if (selectedGeo) {
            const geoObject = selectedGeo.GeoObject;
            const meta = geoObject.metaDataProperty.GeocoderMetaData;

            const address: AddressResult = {
              lat: marker[1].toString(),
              lon: marker[0].toString(),
              administrativeAreaName:
                geoObject.description || meta.Address?.formatted || "",
              localityName: geoObject.name || meta.text || "",
            };

            setAddress(address);
          }
        } else {
          toast("Ошибка поиска");
        }
        console.log(address);
      } catch {
        toast("Ошибка поиска");
        setMapCenter(DEFAULT_CENTER as [number, number]);
        setMarker(DEFAULT_CENTER as [number, number]);
      } finally {
        setIsSearching(false);
      }
    };
    handleSearchYandex();
  }, [marker, mapCenter]);

  useEffect(() => {
    if (addressData === null) return;
    setSearchQueryResult([]);
    const array: AddressResult[] = [];
    addressData.featureMember.map((geo) => {
      console.log(geo.GeoObject);

      if (geo.GeoObject.metaDataProperty.GeocoderMetaData.kind === "locality") {
        const address: AddressResult = {
          lat: geo.GeoObject.Point.pos.split(" ")[1],
          lon: geo.GeoObject.Point.pos.split(" ")[0],
          administrativeAreaName: geo.GeoObject.metaDataProperty
            .GeocoderMetaData.AddressDetails.Country?.AdministrativeArea
            ?.AdministrativeAreaName
            ? geo.GeoObject.metaDataProperty.GeocoderMetaData.AddressDetails
                .Country.AdministrativeArea.AdministrativeAreaName
            : geo.GeoObject.metaDataProperty.GeocoderMetaData.AddressDetails
                .Country.CountryName,
          localityName: geo.GeoObject.metaDataProperty.GeocoderMetaData
            .AddressDetails.Country?.AdministrativeArea?.SubAdministrativeArea
            ?.Locality?.LocalityName
            ? geo.GeoObject.metaDataProperty.GeocoderMetaData.AddressDetails
                .Country.AdministrativeArea.SubAdministrativeArea.Locality
                .LocalityName
            : geo.GeoObject.metaDataProperty.GeocoderMetaData.AddressDetails
                .Country.AddressLine,
        };

        array.push(address);
      }
    });
    setSearchQueryResult(array);
    console.log(searchQueryResult);
  }, [addressData]);

  const handleAddFavoriteAddress = (address: AddressResult | null) => {
    const ls = window.localStorage;
    let state = false;
    console.log(ls.getItem("favorites"));
    if (ls.getItem("favorites")) {
      const favorites: AddressResult[] = JSON.parse(ls.getItem("favorites"));
      if (address) {
        favorites.forEach((favorite) => {
          if (favorite.lat === address.lat && favorite.lon === address.lon) {
            state = true;
            return;
          }
        });
        if (!state) {
          favorites.push(address);
        }
      }
      ls.setItem("favorites", JSON.stringify(favorites));
    } else {
      ls.setItem("favorites", JSON.stringify([address]));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Toaster />
      <div className="flex flex-col gap-4">
        <div className="">
          <div className="flex w-2xl mx-auto justify-center gap-2 p-2 z-[1000] rounded-2xl items-center">
            <div className="relative flex flex-1 gap-2 flex-col">
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => handleAddFavoriteAddress(address)}
                  className="bg-white/20 backdrop-blur-2xl rounded-3xl border border-gray-300 text-black items-center hover:bg-gray-200 ease-in-out"
                >
                  <Star />В избранное
                </Button>
                <Input
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className=" px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500
            bg-white rounded-2xl hover:bg-gray-100 ease-in-out delay-75 text-black"
                />
                <Button
                  onClick={handleLocateMe}
                  className="bg-white/20 backdrop-blur-2xl rounded-3xl border border-gray-300 text-black items-center hover:bg-gray-200 ease-in-out"
                >
                  <MousePointer2 />
                  Найти меня
                </Button>
              </div>
              {(isSearchFocused && searchQueryResult.length > 0) ||
                (favorites && (
                  <div className="w-full absolute top-full left-0 mt-2 z-500 bg-white border p-4 rounded-xl">
                    <ul className="">
                      {searchQueryResult.map((res, index) => (
                        <li
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setMarker([Number(res.lat), Number(res.lon)]);
                            setMapCenter([Number(res.lat), Number(res.lon)]);
                            setSearchParams({
                              lat: String(Number(res.lat).toFixed(6)),
                              lon: String(Number(res.lon).toFixed(6)),
                            });
                            setSearchPlaceholder(
                              `${res.localityName}, ${res.administrativeAreaName}`,
                            );
                            setSearchQuery("");
                            setIsSearchFocused(false);
                          }}
                          className="rounded-xl hover:bg-gray-300 p-2 cursor-pointer text-black"
                        >
                          <p>{res.localityName}</p>
                          <p>{res.administrativeAreaName}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mx-auto h-full w-full">
          {weatherData && (
            <div className="relative bg-[url(/img/Sunny.jpeg)] flex-1 rounded-xl overflow-hidden">
              <div className="p-6">
                {!address ? (
                  <div className="flex flex-col gap-1">
                    <Skeleton className="w-[160px] h-[40px]" />
                    <Skeleton className="w-[160px] h-[28px]" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 mb-2">
                    <p className="text-4xl font-semibold text-white line-clamp-1">
                      {address?.localityName}
                    </p>
                    <span className="text-xl text-gray-300 line-clamp-1">
                      {address?.administrativeAreaName}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center my-5">
                  <div className="relative items-center gap-2 flex bg-white/20 backdrop-blur-lg rounded-3xl p-2 pt-0 border border-white/20">
                    <div className="absolute inset-0 bg-black/20 rounded-3xl" />

                    <div className="relative z-10 flex flex-col gap-4 items-center text-white text-shadow-lg items-centerfont-semibold">
                      <p className="font-semibold text-9xl text-white">
                        {Math.round(weatherData.current.temperature_2m)}°
                      </p>
                      <div className="text-white font-semibold">
                        <div className="flex gap-2 items-center">
                          <div className="p-1 bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 shadow">
                            {
                              getWeatherType(weatherData.current.weather_code)
                                .icon
                            }
                          </div>
                          <div className="flex flex-col w-[170px] text-sm">
                            <p>
                              {
                                getWeatherType(weatherData.current.weather_code)
                                  .name
                              }
                            </p>
                            <p>
                              Ощущается как
                              {" " +
                                Math.round(
                                  weatherData.current.apparent_temperature,
                                )}
                              °
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-full">
                    <div className="grid grid-rows-2 grid-cols-2 gap-1 content-stretch">
                      {func(weatherData.current).map((stat) => (
                        <LiquidCard value={stat.value} icon={stat.icon} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <MiniMap
            marker={marker}
            setMarker={setMarker}
            mapCenter={mapCenter}
            setMapCenter={setMapCenter}
          />
        </div>
        <Slider weatherHourlyData={weatherData?.hourly} />
        <TemperatureChart
          dataHourly={getDayNightTempMAx(weatherData?.hourly)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="w-7xl mx-auto">
      <FavoritesProvider>
        <Map />
      </FavoritesProvider>
    </div>
  );
}
