import io
import uuid
import os
from PIL import Image
from ultralytics import YOLO


model = YOLO("illnessesTeeth.pt")

def run_yolo_prediction(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    
    results = model.predict(image)
    result = results[0]

    # رسم المربعات على الصورة (ستظهر كل المربعات لكل الأسنان)
    plotted_image_array = result.plot() 
    plotted_image = Image.fromarray(plotted_image_array[..., ::-1]) 
    
    # --- التعديل هنا: استخراج قائمة بكل التشخيصات ---
    all_detections = []
    
    if len(result.boxes) > 0:
        for box in result.boxes:
            label = model.names[int(box.cls)]
            confidence = float(box.conf)
            all_detections.append({
                "label": label,
                "confidence": round(confidence, 2)
            })
    else:
        all_detections.append({
            "label": "No Issues Detected",
            "confidence": 0.0
        })

    # حفظ الصورة
    temp_filename = f"analysed_{uuid.uuid4()}.png"
    temp_path = os.path.join("static/temp", temp_filename)
    os.makedirs("static/temp", exist_ok=True)
    plotted_image.save(temp_path)
    
    return {
        "all_predictions": all_detections, # مصفوفة تحتوي على كل الأمراض
        "temp_filename": temp_filename,
        "image_url": f"http://127.0.0.1:8000/static/temp/{temp_filename}"
    }