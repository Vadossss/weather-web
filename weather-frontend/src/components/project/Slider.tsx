import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./style.css";

import { Pagination, Navigation } from "swiper/modules";
import type { WeatherHourly } from "@/types/weather";
import { getWeatherType } from "@/App";

const calcEndRange = (data: WeatherHourly[]): WeatherHourly[] => {
  const startRange = new Date().getHours() + 1;

  return data.slice(startRange, 72);
};

interface SliderProps {
  weatherHourlyData: WeatherHourly[];
}

function SliderPerViewValue() {
  const width = window.innerWidth;
  console.log(width);

  if (width > 1024) {
    return 13;
  } else if (width < 1024 && width > 768) {
    return 9;
  } else if (width < 768 && width > 425) {
    return 5;
  } else if (width > 425) {
    return 4;
  } else {
    return 13;
  }
}

export const Slider: React.FC<SliderProps> = ({ weatherHourlyData }) => {
  const nextRef = useRef(null);
  const prevRef = useRef(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [perView, setPerView] = useState(13);

  useEffect(() => {
    const width = window.innerWidth;
    console.log(width);

    if (width > 1024) {
      setPerView(13);
    } else if (width < 1024 && width > 768) {
      setPerView(9);
    } else if (width < 768 && width > 425) {
      setPerView(5);
    } else if (width > 425) {
      setPerView(4);
    } else {
      setPerView(13);
    }
  }, [window.outerWidth]);

  return (
    <div className="relative">
      <button
        ref={prevRef}
        className="group absolute w-10 h-10 left-0 top-1/2 z-10 -translate-y-1/2 bg-white border border-gray-300/20 hover:bg-orange-500 transition-colors duration-300 ease-in p-2 rounded-full flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="8px"
          height="14px"
          viewBox="0 0 8 14"
          fill="#"
          className="-scale-x-100 group-hover:fill-amber-500 group-hover:text-white transition-colors duration-300"
        >
          <path d="M1.3 0 8 7l-6.7 7L0 12.7 5.5 7 0 1.3z" />
        </svg>
      </button>
      <button
        ref={nextRef}
        className="group absolute w-10 h-10 top-1/2 right-0 z-10 -translate-y-1/2 bg-white border border-gray-300/20 hover:bg-orange-500 transition-colors duration-300 ease-in p-2 rounded-full flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="8px"
          height="14px"
          viewBox="0 0 8 14"
          fill="#"
          className="group-hover:fill-amber-500 group-hover:text-orange-900 transition-colors duration-300"
        >
          <path d="M1.3 0 8 7l-6.7 7L0 12.7 5.5 7 0 1.3z" />
        </svg>
      </button>
      <Swiper
        slidesPerView={4}
        spaceBetween={2}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current,
        }}
        breakpoints={{
          425: { slidesPerView: 3 }, // ≥ 425px
          768: { slidesPerView: 6 }, // ≥ 768px
          1024: { slidesPerView: 9 }, // ≥ 1024px
          1280: { slidesPerView: 13 }, // ≥ 1280px
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {calcEndRange(weatherHourlyData).map(
          (data: WeatherHourly, index: number) => (
            <SwiperSlide
              className="bg-transparent! cursor-grab active:cursor-grabbing relative"
              key={index}
            >
              <div className="w-full relative items-center justify-center gap-2 flex bg-white/20 backdrop-blur-lg rounded-3xl p-2 border border-white/20">
                <div className="absolute inset-0 bg-black/25 rounded-3xl" />

                <div className="relative z-10 flex flex-col gap-2 text-white items-center font-semibold text-shadow-lg">
                  <p>{new Date(data.time).getHours()}:00</p>
                  <div>{getWeatherType(data.weather_code).icon}</div>
                  <p>{data.temperature_2m.toFixed(0)}°</p>
                </div>
              </div>
              {new Date(data.time).getHours() === 23 &&
                index + 1 !== calcEndRange(weatherHourlyData).length && (
                  <div className="h-25 border-l-2 border-gray-500 ml-0.5"></div>
                )}
            </SwiperSlide>
          ),
        )}
      </Swiper>
    </div>
  );
};
