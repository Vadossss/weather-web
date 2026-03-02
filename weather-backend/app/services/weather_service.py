import httpx

import pandas as pd

from app.models.coordinate_params import CoordinateParams

async def get_weather_data(coordinates: CoordinateParams):

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": coordinates.latitude,
        "longitude": coordinates.longitude,
        "daily": [
            "weather_code", "temperature_2m_max", "temperature_2m_min",
            "apparent_temperature_max", "apparent_temperature_min",
            "sunrise", "daylight_duration", "sunset",
            "sunshine_duration", "uv_index_max",
            "uv_index_clear_sky_max", "rain_sum", "showers_sum",
            "precipitation_sum", "snowfall_sum",
            "precipitation_hours", "precipitation_probability_max",
            "wind_speed_10m_max", "wind_gusts_10m_max",
            "wind_direction_10m_dominant", "shortwave_radiation_sum"
        ],
        "hourly": [
            "temperature_2m", "relative_humidity_2m", "dew_point_2m",
            "apparent_temperature", "precipitation_probability",
            "precipitation", "rain", "showers", "snowfall",
            "snow_depth", "weather_code", "pressure_msl",
            "surface_pressure", "cloud_cover", "cloud_cover_low",
            "cloud_cover_high", "cloud_cover_mid",
            "evapotranspiration", "visibility",
            "et0_fao_evapotranspiration", "vapour_pressure_deficit"
        ],
        "current": [
            "temperature_2m", "relative_humidity_2m",
            "apparent_temperature", "is_day", "precipitation",
            "rain", "showers", "snowfall", "weather_code",
            "cloud_cover", "pressure_msl", "surface_pressure",
            "wind_speed_10m", "wind_direction_10m",
            "wind_gusts_10m"
        ],
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    current_json = data.get("current", {})

    hourly = data.get("hourly", {})

    hourly_dataframe = pd.DataFrame(hourly)
    if "time" in hourly_dataframe.columns:
        hourly_dataframe["time"] = pd.to_datetime(hourly_dataframe["time"]).astype(str)

    hourly_json = hourly_dataframe.to_dict(orient="records")

    daily = data.get("daily", {})

    daily_dataframe = pd.DataFrame(daily)
    if "time" in daily_dataframe.columns:
        daily_dataframe["time"] = pd.to_datetime(daily_dataframe["time"]).astype(str)

    daily_json = daily_dataframe.to_dict(orient="records")

    return {
        "current": current_json,
        "hourly": hourly_json,
        "daily": daily_json
    }

# async def get_weather_data(coordinates: CoordinateParams):
# 	cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
# 	retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
# 	openmeteo = openmeteo_requests.Client(session = retry_session)
#
# 	# Make sure all required weather variables are listed here
# 	# The order of variables in hourly or daily is important to assign them correctly below
# 	url = "https://api.open-meteo.com/v1/forecast"
# 	params = {
# 		"latitude": coordinates.latitude,
# 		"longitude": coordinates.longitude,
# 		"daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max",
# 				  "apparent_temperature_min", "sunrise", "daylight_duration", "sunset", "sunshine_duration",
# 				  "uv_index_max", "uv_index_clear_sky_max", "rain_sum", "showers_sum", "precipitation_sum",
# 				  "snowfall_sum", "precipitation_hours", "precipitation_probability_max", "wind_speed_10m_max",
# 				  "wind_gusts_10m_max", "wind_direction_10m_dominant", "shortwave_radiation_sum"],
# 		"hourly": ["temperature_2m", "relative_humidity_2m", "dew_point_2m", "apparent_temperature",
# 				   "precipitation_probability", "precipitation", "rain", "showers", "snowfall", "snow_depth",
# 				   "weather_code", "pressure_msl", "surface_pressure", "cloud_cover", "cloud_cover_low",
# 				   "cloud_cover_high", "cloud_cover_mid", "evapotranspiration", "visibility",
# 				   "et0_fao_evapotranspiration", "vapour_pressure_deficit"],
# 		"current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "precipitation", "rain",
# 					"showers", "snowfall", "weather_code", "cloud_cover", "pressure_msl", "surface_pressure",
# 					"wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
# 		"timezone": "auto",
# 	}
# 	responses = openmeteo.weather_api(url, params=params, timeout=5)
# 	# responses = openmeteo.weather_api(url, params=params)
#
# 	# Process first location. Add a for-loop for multiple locations or weather models
# 	response = responses[0]
# 	print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
# 	print(f"Elevation: {response.Elevation()} m asl")
# 	print(f"Timezone: {response.Timezone()}{response.TimezoneAbbreviation()}")
# 	print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")
#
#
# 	# Process current data. The order of variables needs to be the same as requested.
# 	current = response.Current()
# 	current_temperature_2m = current.Variables(0).Value()
# 	current_relative_humidity_2m = current.Variables(1).Value()
# 	current_apparent_temperature = current.Variables(2).Value()
# 	current_is_day = current.Variables(3).Value()
# 	current_precipitation = current.Variables(4).Value()
# 	current_rain = current.Variables(5).Value()
# 	current_showers = current.Variables(6).Value()
# 	current_snowfall = current.Variables(7).Value()
# 	current_weather_code = current.Variables(8).Value()
# 	current_cloud_cover = current.Variables(9).Value()
# 	current_pressure_msl = current.Variables(10).Value()
# 	current_surface_pressure = current.Variables(11).Value()
# 	current_wind_speed_10m = current.Variables(12).Value()
# 	current_wind_direction_10m = current.Variables(13).Value()
# 	current_wind_gusts_10m = current.Variables(14).Value()
#
# 	current_json = {
# 		"temperature_2m": current_temperature_2m,
# 		"relative_humidity_2m": current_relative_humidity_2m,
# 		"apparent_temperature": current_apparent_temperature,
# 		"is_day": bool(current_is_day),
# 		"precipitation": current_precipitation,
# 		"rain": current_rain,
# 		"showers": current_showers,
# 		"snowfall": current_snowfall,
# 		"weather_code": current_weather_code,
# 		"cloud_cover": current_cloud_cover,
# 		"pressure_msl": current_pressure_msl,
# 		"surface_pressure": current_surface_pressure,
# 		"wind_speed_10m": current_wind_speed_10m,
# 		"wind_direction_10m": current_wind_direction_10m,
# 		"wind_gusts_10m": current_wind_gusts_10m,
# 	}
#
# 	hourly = response.Hourly()
# 	hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
# 	hourly_relative_humidity_2m = hourly.Variables(1).ValuesAsNumpy()
# 	hourly_dew_point_2m = hourly.Variables(2).ValuesAsNumpy()
# 	hourly_apparent_temperature = hourly.Variables(3).ValuesAsNumpy()
# 	hourly_precipitation_probability = hourly.Variables(4).ValuesAsNumpy()
# 	hourly_precipitation = hourly.Variables(5).ValuesAsNumpy()
# 	hourly_rain = hourly.Variables(6).ValuesAsNumpy()
# 	hourly_showers = hourly.Variables(7).ValuesAsNumpy()
# 	hourly_snowfall = hourly.Variables(8).ValuesAsNumpy()
# 	hourly_snow_depth = hourly.Variables(9).ValuesAsNumpy()
# 	hourly_weather_code = hourly.Variables(10).ValuesAsNumpy()
# 	hourly_pressure_msl = hourly.Variables(11).ValuesAsNumpy()
# 	hourly_surface_pressure = hourly.Variables(12).ValuesAsNumpy()
# 	hourly_cloud_cover = hourly.Variables(13).ValuesAsNumpy()
# 	hourly_cloud_cover_low = hourly.Variables(14).ValuesAsNumpy()
# 	hourly_cloud_cover_high = hourly.Variables(15).ValuesAsNumpy()
# 	hourly_cloud_cover_mid = hourly.Variables(16).ValuesAsNumpy()
# 	hourly_evapotranspiration = hourly.Variables(17).ValuesAsNumpy()
# 	hourly_visibility = hourly.Variables(18).ValuesAsNumpy()
# 	hourly_et0_fao_evapotranspiration = hourly.Variables(19).ValuesAsNumpy()
# 	hourly_vapour_pressure_deficit = hourly.Variables(20).ValuesAsNumpy()
#
# 	hourly_data = {"date": pd.date_range(
# 		start=pd.to_datetime(hourly.Time() + response.UtcOffsetSeconds(), unit="s", utc=True),
# 		end=pd.to_datetime(hourly.TimeEnd() + response.UtcOffsetSeconds(), unit="s", utc=True),
# 		freq=pd.Timedelta(seconds=hourly.Interval()),
# 		inclusive="left"
# 	)}
#
# 	hourly_data["temperature_2m"] = hourly_temperature_2m
# 	hourly_data["relative_humidity_2m"] = hourly_relative_humidity_2m
# 	hourly_data["dew_point_2m"] = hourly_dew_point_2m
# 	hourly_data["apparent_temperature"] = hourly_apparent_temperature
# 	hourly_data["precipitation_probability"] = hourly_precipitation_probability
# 	hourly_data["precipitation"] = hourly_precipitation
# 	hourly_data["rain"] = hourly_rain
# 	hourly_data["showers"] = hourly_showers
# 	hourly_data["snowfall"] = hourly_snowfall
# 	hourly_data["snow_depth"] = hourly_snow_depth
# 	hourly_data["weather_code"] = hourly_weather_code
# 	hourly_data["pressure_msl"] = hourly_pressure_msl
# 	hourly_data["surface_pressure"] = hourly_surface_pressure
# 	hourly_data["cloud_cover"] = hourly_cloud_cover
# 	hourly_data["cloud_cover_low"] = hourly_cloud_cover_low
# 	hourly_data["cloud_cover_high"] = hourly_cloud_cover_high
# 	hourly_data["cloud_cover_mid"] = hourly_cloud_cover_mid
# 	hourly_data["evapotranspiration"] = hourly_evapotranspiration
# 	hourly_data["visibility"] = hourly_visibility
# 	hourly_data["et0_fao_evapotranspiration"] = hourly_et0_fao_evapotranspiration
# 	hourly_data["vapour_pressure_deficit"] = hourly_vapour_pressure_deficit
#
# 	hourly_dataframe = pd.DataFrame(data=hourly_data)
# 	hourly_dataframe["time"] = hourly_dataframe["date"].astype(str)
# 	hourly_dataframe = hourly_dataframe.drop(columns=["date"])
# 	hourly_json = hourly_dataframe.to_dict(orient="records")
#
# 	# Process daily data. The order of variables needs to be the same as requested.
# 	daily = response.Daily()
# 	daily_weather_code = daily.Variables(0).ValuesAsNumpy()
# 	daily_temperature_2m_max = daily.Variables(1).ValuesAsNumpy()
# 	daily_temperature_2m_min = daily.Variables(2).ValuesAsNumpy()
# 	daily_apparent_temperature_max = daily.Variables(3).ValuesAsNumpy()
# 	daily_apparent_temperature_min = daily.Variables(4).ValuesAsNumpy()
# 	daily_sunrise = daily.Variables(5).ValuesInt64AsNumpy()
# 	daily_daylight_duration = daily.Variables(6).ValuesAsNumpy()
# 	daily_sunset = daily.Variables(7).ValuesInt64AsNumpy()
# 	daily_sunshine_duration = daily.Variables(8).ValuesAsNumpy()
# 	daily_uv_index_max = daily.Variables(9).ValuesAsNumpy()
# 	daily_uv_index_clear_sky_max = daily.Variables(10).ValuesAsNumpy()
# 	daily_rain_sum = daily.Variables(11).ValuesAsNumpy()
# 	daily_showers_sum = daily.Variables(12).ValuesAsNumpy()
# 	daily_precipitation_sum = daily.Variables(13).ValuesAsNumpy()
# 	daily_snowfall_sum = daily.Variables(14).ValuesAsNumpy()
# 	daily_precipitation_hours = daily.Variables(15).ValuesAsNumpy()
# 	daily_precipitation_probability_max = daily.Variables(16).ValuesAsNumpy()
# 	daily_wind_speed_10m_max = daily.Variables(17).ValuesAsNumpy()
# 	daily_wind_gusts_10m_max = daily.Variables(18).ValuesAsNumpy()
# 	daily_wind_direction_10m_dominant = daily.Variables(19).ValuesAsNumpy()
# 	daily_shortwave_radiation_sum = daily.Variables(20).ValuesAsNumpy()
#
# 	daily_data = {"date": pd.date_range(
# 		start=pd.to_datetime(daily.Time() + response.UtcOffsetSeconds(), unit="s", utc=True),
# 		end=pd.to_datetime(daily.TimeEnd() + response.UtcOffsetSeconds(), unit="s", utc=True),
# 		freq=pd.Timedelta(seconds=daily.Interval()),
# 		inclusive="left"
# 	)}
#
# 	daily_data["weather_code"] = daily_weather_code
# 	daily_data["temperature_2m_max"] = daily_temperature_2m_max
# 	daily_data["temperature_2m_min"] = daily_temperature_2m_min
# 	daily_data["apparent_temperature_max"] = daily_apparent_temperature_max
# 	daily_data["apparent_temperature_min"] = daily_apparent_temperature_min
# 	daily_data["sunrise"] = daily_sunrise
# 	daily_data["daylight_duration"] = daily_daylight_duration
# 	daily_data["sunset"] = daily_sunset
# 	daily_data["sunshine_duration"] = daily_sunshine_duration
# 	daily_data["uv_index_max"] = daily_uv_index_max
# 	daily_data["uv_index_clear_sky_max"] = daily_uv_index_clear_sky_max
# 	daily_data["rain_sum"] = daily_rain_sum
# 	daily_data["showers_sum"] = daily_showers_sum
# 	daily_data["precipitation_sum"] = daily_precipitation_sum
# 	daily_data["snowfall_sum"] = daily_snowfall_sum
# 	daily_data["precipitation_hours"] = daily_precipitation_hours
# 	daily_data["precipitation_probability_max"] = daily_precipitation_probability_max
# 	daily_data["wind_speed_10m_max"] = daily_wind_speed_10m_max
# 	daily_data["wind_gusts_10m_max"] = daily_wind_gusts_10m_max
# 	daily_data["wind_direction_10m_dominant"] = daily_wind_direction_10m_dominant
# 	daily_data["shortwave_radiation_sum"] = daily_shortwave_radiation_sum
#
# 	daily_dataframe = pd.DataFrame(daily_data)
#
# 	daily_dataframe["date"] = daily_dataframe["date"].astype(str)
# 	daily_json = daily_dataframe.to_dict(orient="records")
#
# 	result = {
# 		"current": current_json,
# 		"daily": daily_json,
# 		"hourly": hourly_json
# 	}
# 	return result
	# return hourly_dataframe.tolist()
