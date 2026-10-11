import React, { useRef, useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

export default function VideoCalibrator({ file, onPointsComplete }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [videoElement, setVideoElement] = useState(null);

  useEffect(() => {
    if (!file) return;
    
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    
    video.onloadeddata = () => {
      // Seek to 1 second to ensure a frame is loaded
      video.currentTime = 1; 
    };

    video.onseeked = () => {
      setVideoElement(video);
      drawFrame(video, []);
    };
  }, [file]);

  const drawFrame = (video, currentPoints) => {
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the actual video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw the polygon and points
    if (currentPoints.length > 0) {
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      ctx.lineWidth = 4;
      
      ctx.beginPath();
      ctx.moveTo(currentPoints[0][0], currentPoints[0][1]);
      
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i][0], currentPoints[i][1]);
      }
      
      if (currentPoints.length === 4) {
        ctx.closePath();
      }
      ctx.stroke();

      currentPoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };

  const handleCanvasClick = (e) => {
    if (points.length >= 4 || !videoElement) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    
    const newPoints = [...points, [x, y]];
    setPoints(newPoints);
    drawFrame(videoElement, newPoints);

    if (newPoints.length === 4) {
      onPointsComplete(newPoints);
    } else {
      onPointsComplete([]);
    }
  };

  const clearPoints = () => {
    setPoints([]);
    onPointsComplete([]);
    drawFrame(videoElement, []);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-300">
          {points.length < 4 
            ? `Click 4 points to define the lane (${points.length}/4)` 
            : "Lane defined successfully."}
        </p>
        {points.length > 0 && (
          <button onClick={clearPoints} className="text-red-500 hover:text-red-400 p-1 flex items-center gap-1 text-xs transition-colors">
            <Trash2 className="w-4 h-4" /> Clear Points
          </button>
        )}
      </div>
      
      <div className="rounded-xl overflow-hidden border border-zinc-700 bg-black">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`w-full cursor-crosshair ${points.length === 4 ? "cursor-default" : ""}`}
        />
      </div>
    </div>
  );
}