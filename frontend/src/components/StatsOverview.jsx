import React from "react";
import { Car, Gauge, AlertTriangle } from "lucide-react";

export default function StatsOverview({ totalVehicles, maxSpeed, violations }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-zinc-500 tracking-wider">VEHICLES TRACKED</h3>
          <Car className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-3xl font-bold text-white">{totalVehicles}</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-zinc-500 tracking-wider">PEAK SPEED RECORDED</h3>
          <Gauge className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-3xl font-bold text-white">{maxSpeed} km/h</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-zinc-500 tracking-wider">SPEEDING ALERTS ({">"} 60 KM/H)</h3>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <p className="text-3xl font-bold text-white">{violations}</p>
      </div>
    </div>
  );
}