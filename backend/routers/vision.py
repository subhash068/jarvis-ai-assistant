from fastapi import APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
import asyncio
import cv2
import json
import base64
import numpy as np

try:
    import mss
except ImportError:
    mss = None

try:
    import pytesseract
    from PIL import Image
    import io
    # Point to the default Windows installation path
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
except ImportError:
    pytesseract = None

try:
    from ultralytics import YOLO
    model = YOLO("yolov8n.pt")  # Load lightweight YOLO model
except ImportError:
    model = None

router = APIRouter(
    prefix="/vision",
    tags=["vision"],
)

@router.get("/status")
async def get_status(source: str = "webcam"):
    return {
        "status": "recording",
        "scene": "live feed",
        "fps": 30 if source == "webcam" else 15,
        "source": source.capitalize(),
        "resolution": "720p"
    }

@router.websocket("/stream")
async def vision_stream(websocket: WebSocket, source: str = "webcam"):
    await websocket.accept()
    if not model:
        await websocket.send_text(json.dumps({"detections": [{"label": "Error: YOLO not installed", "score": 1.0}], "frame": ""}))
        return

    cap = None
    sct = None
    
    if source == "webcam":
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            await websocket.send_text(json.dumps({"detections": [{"label": "Error: No Webcam Found", "score": 1.0}], "frame": ""}))
            return
    elif source == "screen":
        if not mss:
            await websocket.send_text(json.dumps({"detections": [{"label": "Error: mss not installed", "score": 1.0}], "frame": ""}))
            return
        sct = mss.mss()

    try:
        while True:
            frame = None
            if source == "webcam":
                ret, frame = cap.read()
                if not ret:
                    break
            elif source == "screen":
                monitor = sct.monitors[1]  # Primary monitor
                sct_img = sct.grab(monitor)
                frame = np.array(sct_img)
                # Convert BGRA to BGR
                frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
                # Resize for performance to 1280x720
                frame = cv2.resize(frame, (1280, 720))

            if frame is None:
                break
                
            # Run YOLO inference on frame
            results = model(frame, verbose=False)
            
            detections = []
            if len(results) > 0:
                result = results[0]
                for box in result.boxes:
                    conf = float(box.conf[0])
                    if conf > 0.3:  # 30% confidence threshold
                        cls = int(box.cls[0])
                        label = result.names[cls]
                        detections.append({
                            "label": label.capitalize(),
                            "score": conf
                        })
            
            # Group by label and keep highest score
            unique_detections = {}
            for d in detections:
                if d["label"] not in unique_detections or unique_detections[d["label"]] < d["score"]:
                    unique_detections[d["label"]] = d["score"]
                    
            final_detections = [{"label": k, "score": v} for k, v in unique_detections.items()]
            final_detections.sort(key=lambda x: x["score"], reverse=True)
            
            # Draw bounding boxes and labels directly on the frame
            annotated_frame = frame
            if len(results) > 0:
                annotated_frame = results[0].plot()
            
            # Encode annotated frame to base64
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send payload containing detections and the image frame
            payload = {
                "detections": final_detections[:5],
                "frame": frame_base64
            }
            await websocket.send_text(json.dumps(payload))
            
            # Small delay to control CPU load (slower for screen capture)
            await asyncio.sleep(0.1 if source == "webcam" else 0.2)
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Vision streaming error: {e}")
    finally:
        if cap:
            cap.release()
        if sct:
            sct.close()

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="YOLO not installed")
        
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
        
    results = model(frame, verbose=False)
    
    detections = []
    annotated_frame = frame
    if len(results) > 0:
        result = results[0]
        annotated_frame = result.plot()
        for box in result.boxes:
            conf = float(box.conf[0])
            if conf > 0.3:
                cls = int(box.cls[0])
                label = result.names[cls]
                detections.append({
                    "label": label.capitalize(),
                    "score": conf
                })
                
    _, buffer = cv2.imencode('.jpg', annotated_frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    
    unique_detections = {}
    for d in detections:
        if d["label"] not in unique_detections or unique_detections[d["label"]] < d["score"]:
            unique_detections[d["label"]] = d["score"]
            
    final_detections = [{"label": k, "score": v} for k, v in unique_detections.items()]
    final_detections.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "detections": final_detections[:10],
        "frame": frame_base64
    }

@router.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    if not pytesseract:
        raise HTTPException(status_code=500, detail="pytesseract not installed")
        
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents))
        text = pytesseract.image_to_string(img)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}. (Is Tesseract-OCR installed on the system?)")
