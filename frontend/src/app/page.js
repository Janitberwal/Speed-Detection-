"use client";

import React, { useState } from "react";
import VideoUploader from "@/components/VideoUploader";
import StatsOverview from "@/components/StatsOverview";
import VideoCalibrator from "@/components/VideoCalibrator";
import { Play, Loader2 } from "lucide-react";
import { uploadVideoForDetection } from "@/lib/api";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [calibrationPoints, setCalibrationPoints] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputVideoUrl, setOutputVideoUrl] = useState(null);
  const [stats, setStats] = useState({ totalVehicles: 0, maxSpeed: 0, violations: 0 });

  const handleStartInference = async () => {
    if (!file || calibrationPoints.length !== 4) return;
    setIsProcessing(true);

    try {
      const data = await uploadVideoForDetection(file, calibrationPoints);
      setOutputVideoUrl(data.videoUrl);
      setStats(data.stats);
    } catch (err) {
      console.error("Error processing video:", err);
      alert("Failed to process video. Check the backend console for errors.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 bg-zinc-950 min-h-screen text-zinc-100">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Vehicle Velocity Analytics
        </h1>
        <p className="text-zinc-400 mt-1">
          Automated vehicle tracking, perspective transformation, and velocity inference.
        </p>
      </div>

      <StatsOverview 
        totalVehicles={stats.totalVehicles} 
        maxSpeed={stats.maxSpeed} 
        violations={stats.violations} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">1. Upload Footage</h2>
            <VideoUploader onFileSelect={(f) => {
              setFile(f);
              setCalibrationPoints([]); // Reset points if user changes video
              setOutputVideoUrl(null);
            }} isLoading={isProcessing} />
          </div>

          {file && (
            <div className="space-y-2 animate-in fade-in duration-500">
              <h2 className="text-lg font-semibold text-white">2. Calibrate ROI</h2>
              <VideoCalibrator file={file} onPointsComplete={setCalibrationPoints} />
            </div>
          )}

          <button
            onClick={handleStartInference}
            disabled={!file || calibrationPoints.length !== 4 || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing (Check Python Terminal)...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Speed Estimation
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Output Stream</h2>
          <div className="aspect-video w-full rounded-xl border border-zinc-800 bg-black flex items-center justify-center text-zinc-500 text-sm overflow-hidden">
            {outputVideoUrl ? (
              <video src={outputVideoUrl} controls autoPlay className="w-full h-full object-contain" />
            ) : (
              <span>No processed footage to preview</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}