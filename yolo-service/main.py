# yolo-service/main.py
from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
from PIL import Image
import io
import os

app = FastAPI()

# Load YOLOv8 model - using yolov8s.pt as base if custom model not available
MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8s.pt")
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}. Falling back to base yolov8s.pt")
    model = YOLO("yolov8s.pt")

@app.post("/validate/pothole")
async def validate_pothole(file: UploadFile = File(...)):
    try:
        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes))
        
        # Run inference - use mps if available (macOS), else cpu
        device = "mps" if os.uname().sysname == "Darwin" else "cpu"
        results = model(img, device=device)
        
        detections = results[0].boxes
        if len(detections) == 0:
            return { "valid": False, "confidence": 0, "reason": "No pothole detected" }
            
        confidence = float(detections.conf.max())
        # Threshold 0.70 as per planning
        return { "valid": confidence >= 0.70, "confidence": round(confidence, 2) }
    except Exception as e:
        return { "error": str(e), "valid": False }

@app.post("/validate/crime")
async def validate_crime(file: UploadFile = File(...)):
    try:
        # Crime validation is technical/spam filter
        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes))
        
        w, h = img.size
        if w < 200 or h < 200:
            return { "valid": False, "reason": "Image too small" }
            
        # Basic technical validation passed
        return { "valid": True, "reason": "Passed technical validation" }
    except Exception as e:
        return { "error": str(e), "valid": False }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
