import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const uploadVideoForDetection = async (file, polygonPoints) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source_points", JSON.stringify(polygonPoints));

  const response = await axios.post(`${API_BASE_URL}/api/process-video`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data; 
};