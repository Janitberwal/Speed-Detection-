import React from "react";
import { FileVideo } from "lucide-react";

export default function VideoUploader({ onFileSelect, isLoading }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="relative border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl bg-zinc-900 transition-colors">
      <input
        type="file"
        accept="video/mp4,video/x-m4v,video/*,video/webm"
        onChange={handleFileChange}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center pointer-events-none">
        <FileVideo className="w-10 h-10 text-blue-500 mb-3" />
        <p className="text-sm font-medium text-white mb-1">Click or drag video to upload</p>
        <p className="text-xs text-zinc-500">MP4, AVI, or MOV (up to 100MB)</p>
      </div>
    </div>
  );
}