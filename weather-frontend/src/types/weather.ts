/** Текущая погода */
export interface WeatherCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

/** Суточный прогноз */
export interface WeatherDaily {
  date: string;
  weather_code: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
  apparent_temperature_max: number;
  apparent_temperature_min: number;
  sunrise: number;
  daylight_duration: number;
  sunset: number;
  sunshine_duration: number;
  uv_index_max: number;
  uv_index_clear_sky_max: number;
  rain_sum: number;
  showers_sum: number;
  precipitation_sum: number;
  snowfall_sum: number;
  precipitation_hours: number;
  precipitation_probability_max: number;
  wind_speed_10m_max: number;
  wind_gusts_10m_max: number;
  wind_direction_10m_dominant: number;
  shortwave_radiation_sum: number;
}

/** Почасовой прогноз */
export interface WeatherHourly {
  time: Date;
  temperature_2m: number;
  relative_humidity_2m: number;
  dew_point_2m: number;
  apparent_temperature: number;
  precipitation_probability: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  snow_depth: number;
  weather_code: number;
  pressure_msl: number;
  surface_pressure: number;
  cloud_cover: number;
  cloud_cover_low: number;
  cloud_cover_high: number;
  cloud_cover_mid: number;
  evapotranspiration: number;
  visibility: number;
  et0_fao_evapotranspiration: number;
  vapour_pressure_deficit: number;
}

export interface WeatherMessage {
  current: WeatherCurrent;
  daily: WeatherDaily[];
  hourly: WeatherHourly[];
}
