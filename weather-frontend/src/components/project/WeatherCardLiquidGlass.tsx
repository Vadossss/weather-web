import type { ReactNode } from "react";

interface CardProps {
  value: string;
  icon: ReactNode;
}

export const LiquidCard: React.FC<CardProps> = ({ value, icon }) => {
  return (
    <div className="relative items-center flex bg-white/20 backdrop-blur-lg rounded-3xl p-2 border border-white/20">
      <div className="absolute inset-0 bg-black/20 rounded-3xl" />

      <div className="relative z-10 flex max-md:flex-col  text-white items-center font-semibold text-shadow-lg">
        <div className="p-1 bg-white/50 rounded-xl border backdrop-blur border-white/20 shadow">
          {icon}
        </div>
        <p className="md:w-[70px] max-md:text-xs text-center">{value}</p>
      </div>
    </div>
  );
};
