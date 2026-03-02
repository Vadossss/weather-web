import { useState, useCallback, useEffect, type ReactNode } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
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
  StarIcon,
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
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, type RootState } from "./app/store";
import {
  addToFavorite,
  removeFromFavorite,
} from "./features/favorites/favoritesSlice";
import { Footer } from "./components/project/Footer";

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
// const DEFAULT_ZOOM = 9;

export interface AddressResult {
  lat: string;
  lon: string;
  administrativeAreaName: string;
  localityName: string;
}

interface StateWeather {
  name: string;
  icon: ReactNode;
  image: string;
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

// function SetViewOnCenter({ center }: { center: [number, number] }) {
//   const map = useMap();
//   useEffect(() => {
//     map.setView(center, map.getZoom());
//   }, [map, center]);
//   return null;
// }

export function getWeatherType(wmoCode: number): StateWeather {
  if (wmoCode === 0)
    return {
      name: "Солнечно",
      icon: <Sun className="size-10" />,
      image: "/img/sunny.jpg",
    };

  if (wmoCode >= 1 && wmoCode <= 3)
    return {
      name: "Переменная облачность",
      icon: <CloudSun className="size-10" />,
      image: "/img/cloud.jpg",
    };

  if (wmoCode >= 4 && wmoCode <= 8)
    return {
      name: "Облачно",
      icon: <Cloud className="size-10" />,
      image: "/img/cloud.jpg",
    };

  if (wmoCode === 45 || wmoCode === 48)
    return {
      name: "Туман",
      icon: <CloudFog className="size-10" />,
      image: "/img/fog.jpg",
    };

  if (wmoCode >= 51 && wmoCode <= 55)
    return {
      name: "Морось",
      icon: <CloudDrizzle className="size-10" />,
      image: "/img/rain.jpg",
    };

  if (wmoCode >= 61 && wmoCode <= 65)
    return {
      name: "Дождь",
      icon: <CloudRain className="size-10" />,
      image: "/img/rain.jpg",
    };

  if (wmoCode >= 66 && wmoCode <= 69)
    return {
      name: "Мокрый снег",
      icon: <CloudSnow className="size-10" />,
      image: "/img/snow.jpg",
    };

  if (wmoCode >= 71 && wmoCode <= 75)
    return {
      name: "Снег",
      icon: <CloudSnow className="size-10" />,
      image: "/img/snow.jpg",
    };

  if (wmoCode >= 80 && wmoCode <= 82)
    return {
      name: "Ливень",
      icon: <CloudRainWind className="size-10" />,
      image: "/img/rain.jpg",
    };

  if (wmoCode >= 83 && wmoCode <= 84)
    return {
      name: "Мокрый снег",
      icon: <CloudSnow className="size-10" />,
      image: "/img/snow.jpg",
    };

  if (wmoCode === 95)
    return {
      name: "Гроза",
      icon: <CloudLightning />,
      image: "/img/thundershtorm.jpg",
    };

  if (wmoCode >= 96 && wmoCode <= 99)
    return {
      name: "Град",
      icon: <CloudHail className="size-10" />,
      image: "/img/thundershtorm.jpg",
    };

  return {
    name: "Что-то",
    icon: <Cloud className="size-10" />,
    image: "/img/sunny.jpg",
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
  const [, setIsSearching] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addressData, setAddressData] = useState<AddressResponse | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    "Поиск адреса или места",
  );
  const dispatch = useDispatch();

  const favorites = useSelector((state: RootState) => state.favorites.items);

  console.log("Favorites: " + favorites);

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
          `/api/v1/weather?latitude=${marker[0]}&longitude=${marker[1]}`,
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
    const array: AddressResult[] = addressData.featureMember
      .map((geo) => {
        const geoObject = geo.GeoObject;
        const meta = geoObject.metaDataProperty.GeocoderMetaData;

        const [lon, lat] = (geoObject.Point.pos ?? "").split(" ");
        if (!lat || !lon) return null;

        const country = meta.AddressDetails?.Country;
        const adminArea = country?.AdministrativeArea;

        const administrativeAreaName =
          geoObject.description ||
          meta.Address?.formatted ||
          adminArea?.AdministrativeAreaName ||
          country?.CountryName ||
          "";

        const localityName =
          geoObject.name ||
          meta.Address?.Components?.find((c) => c.kind === "locality")?.name ||
          meta.text ||
          "";

        return {
          lat,
          lon,
          administrativeAreaName,
          localityName,
        } satisfies AddressResult;
      })
      .filter((x): x is AddressResult => x !== null);

    const uniq = new globalThis.Map<string, AddressResult>();
    for (const item of array) uniq.set(`${item.lat}|${item.lon}`, item);

    setSearchQueryResult([...uniq.values()]);
  }, [addressData]);

  const handleAddFavoriteAddress = (address: AddressResult | null) => {
    const ls = window.localStorage;
    let state = false;

    const raw = ls.getItem("favorites");

    if (raw) {
      const favorites: AddressResult[] = JSON.parse(raw);
      if (address) {
        favorites.forEach((favorite) => {
          if (favorite.lat === address.lat && favorite.lon === address.lon) {
            state = true;
            return;
          }
        });
        if (!state) {
          favorites.push(address);
          dispatch(addToFavorite(address));
        }
      }
      ls.setItem("favorites", JSON.stringify(favorites));
    } else {
      ls.setItem("favorites", JSON.stringify([address]));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Toaster />
      <div className="flex flex-col gap-6">
        <div className="p-2 ">
          <div className="relative flex w-full max-w-3xl mx-auto justify-center gap-3 p-3 z-[1000] rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-lg">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/15 via-white/5 to-white/10 opacity-80" />
            <div className="relative z-10 flex flex-1 gap-2 flex-col">
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAddFavoriteAddress(address)}
                  className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 text-slate-900 hover:bg-white/40 hover:text-slate-900 ease-in-out shadow-[0_14px_35px_rgba(15,23,42,0.55)]"
                >
                  <Star />В избранное
                </Button>
                <div className="relative flex-1">
                  <Input
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full px-3 py-2 border text-black border-white/30 focus:outline-none focus:ring-1 focus:ring-sky-400/60 bg-white rounded-2xl ease-in-out delay-75 placeholder:text-gray-500 shadow-[0_12px_30px_rgba(15,23,42,0.6)]"
                  />
                  {isSearchFocused &&
                    (searchQueryResult.length > 0 || favorites.length > 0) && (
                      <div className="absolute top-full left-0 mt-3 w-full z-500">
                        <ul className="bg-white backdrop-blur-2xl border border-white/25 p-3 rounded-2xl shadow-[0_22px_55px_rgba(15,23,42,0.85)] space-y-1">
                          {favorites.slice(0, 5).map((item, index) => (
                            <li
                              key={index}
                              className="hover:bg-gray-200 rounded-xl p-2 cursor-pointer text-slate-50 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setMarker([
                                      Number(item.lon),
                                      Number(item.lat),
                                    ]);
                                    setMapCenter([
                                      Number(item.lon),
                                      Number(item.lat),
                                    ]);
                                    setSearchParams({
                                      lat: String(Number(item.lat).toFixed(6)),
                                      lon: String(Number(item.lon).toFixed(6)),
                                    });
                                    setSearchPlaceholder(
                                      `${item.localityName}, ${item.administrativeAreaName}`,
                                    );
                                    setSearchQuery("");
                                    setIsSearchFocused(false);
                                  }}
                                  className="flex flex-1 flex-col"
                                >
                                  <p className="text-sm font-medium text-black">
                                    {item.localityName}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    {item.administrativeAreaName}
                                  </p>
                                </div>
                                <div className="pointer-events-auto">
                                  <StarIcon
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      dispatch(removeFromFavorite(item));
                                    }}
                                    className="text-orange-300 fill-orange-300 hover:fill-slate-300 hover:text-slate-300"
                                  />
                                </div>
                              </div>
                            </li>
                          ))}
                          {searchQueryResult.slice(0, 4).map((res, index) => (
                            <li
                              key={index}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setMarker([Number(res.lat), Number(res.lon)]);
                                setMapCenter([
                                  Number(res.lat),
                                  Number(res.lon),
                                ]);
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
                              className="hover:bg-gray-200 rounded-xl p-2 cursor-pointer text-slate-50 transition-colors"
                            >
                              <p className="text-sm font-medium text-black">
                                {res.localityName}
                              </p>
                              <p className="text-xs text-gray-700">
                                {res.administrativeAreaName}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
                <Button
                  onClick={handleLocateMe}
                  className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 text-slate-900 items-center hover:bg-white/40 hover:text-slate-900 ease-in-out shadow-[0_14px_35px_rgba(15,23,42,0.55)]"
                >
                  <MousePointer2 />
                  Найти меня
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mx-auto h-full w-full">
          {weatherData && (
            <div
              style={{
                backgroundImage: `url(${getWeatherType(weatherData.current.weather_code).image})`,
              }}
              className={`relative bg-cover bg-center flex-1 rounded-3xl overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/50 to-sky-900/40" />
              <div className="relative p-6">
                <div className="flex justify-between">
                  {!address ? (
                    <div className="flex flex-col gap-1">
                      <Skeleton className="w-[160px] h-[40px]" />
                      <Skeleton className="w-[160px] h-[28px]" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 mb-2">
                      <p className="text-4xl font-semibold text-white line-clamp-1 drop-shadow-[0_10px_32px_rgba(0,0,0,0.9)]">
                        {address?.localityName}
                      </p>
                      <span className="text-xl text-slate-200 line-clamp-1 drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]">
                        {address?.administrativeAreaName}
                      </span>
                    </div>
                  )}
                  <div className="text-lg text-slate-100/80">
                    {new Intl.DateTimeFormat("ru-RU", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    }).format(new Date())}
                  </div>
                </div>
                <div className="flex justify-between items-center my-5 gap-4">
                  <div className="relative items-center gap-2 flex bg-white/15 backdrop-blur-2xl rounded-3xl p-4 pt-3 border border-white/25 shadow-[0_26px_70px_rgba(15,23,42,0.95)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-3xl" />

                    <div className="relative z-10 flex flex-col gap-4 items-center text-white text-shadow-lg font-semibold">
                      <p className="font-semibold text-9xl text-white">
                        {Math.round(weatherData.current.temperature_2m)}°
                      </p>
                      <div className="text-white font-semibold">
                        <div className="flex gap-2 items-center">
                          <div className="p-1 bg-white/30 backdrop-blur-lg rounded-xl border border-white/25 shadow-[0_16px_40px_rgba(15,23,42,0.85)]">
                            {
                              getWeatherType(weatherData.current.weather_code)
                                .icon
                            }
                          </div>
                          <div className="flex flex-col w-[180px] text-sm">
                            <p className="text-slate-100">
                              {
                                getWeatherType(weatherData.current.weather_code)
                                  .name
                              }
                            </p>
                            <p className="text-slate-200/90">
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
                    <div className="grid grid-rows-2 grid-cols-2 gap-2 content-stretch">
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
        {weatherData?.hourly && (
          <>
            <Slider weatherHourlyData={weatherData.hourly} />
            <TemperatureChart
              dataHourly={getDayNightTempMAx(weatherData.hourly)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="w-7xl mx-auto">
      <Provider store={store}>
        <Map />
        <Footer />
      </Provider>
    </div>
  );
}
