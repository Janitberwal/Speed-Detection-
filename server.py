from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
import json
from main import process_video_file

app = FastAPI()

# In production, you would restrict this to your specific Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("temp", exist_ok=True)
os.makedirs("output", exist_ok=True)

app.mount("/output", StaticFiles(directory="output"), name="output")

@app.post("/api/process-video")
async def process_video_endpoint(
    request: Request, # Added Request object here
    file: UploadFile = File(...),
    source_points: str = Form(...) 
):
    job_id = str(uuid.uuid4())
    input_path = f"temp/{job_id}_{file.filename}"
    output_filename = f"{job_id}_result.webm"
    output_path = f"output/{output_filename}"
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    points_list = json.loads(source_points)
    stats = process_video_file(input_path, output_path, points_list)
    
    if os.path.exists(input_path):
        os.remove(input_path)
    
    # Automatically get the base URL (localhost OR huggingface.co)
    base_url = str(request.base_url).rstrip("/")
    
    return JSONResponse(content={
        "videoUrl": f"{base_url}/output/{output_filename}",
        "stats": stats
    })

if __name__ == "__main__":
    import uvicorn
    # Hugging Face uses port 7860
    uvicorn.run(app, host="0.0.0.0", port=7860)