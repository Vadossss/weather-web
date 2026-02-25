import type { ReactNode } from "react";

interface CardProps {
  value: string;
  icon: ReactNode;
}

export const LiquidCard: React.FC<CardProps> = ({ value, icon }) => {
  return (
    <div className="relative items-center gap-2 flex bg-white/20 backdrop-blur-lg rounded-3xl p-2 border border-white/20">
      <div className="absolute inset-0 bg-black/20 rounded-3xl" />

      <div className="relative z-10 flex gap-2 text-white items-center font-semibold text-shadow-lg">
        <div className="p-1 bg-white/50 rounded-xl border backdrop-blur border-white/20 shadow">
          {icon}
        </div>
        <p className="w-[70px]">{value}</p>
      </div>
    </div>
  );
};
