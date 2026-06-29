import io
import uuid
import os
import json
from PIL import Image, ImageDraw
from ultralytics import YOLO

# 1. تحميل نموذج الأسنان الأساسي
model_teeth = YOLO("best.pt")

# 2. تحميل نماذج الأمراض الأربعة بناءً على الصورة
model_1 = YOLO("illnessesTeeth.pt")  # الخاص بـ Impacted
model_2 = YOLO(r"C:\Users\User\Downloads\yolo_ill_One_robflow_goodالأول\weights\best.pt")  # الخاص بـ Crown, Bridge
model_3 = YOLO(r"C:\Users\User\Downloads\yolo_kaggle_class30_two\weights\best.pt")  # الخاص بـ Implant, Braces
model_4 = YOLO(r"C:\Users\User\Downloads\kaggleillDentexالثاني\weights\best.pt")  # الخاص بـ Caries, Filling, Root Canal

def run_yolo_prediction(image_bytes):
    # 1. فتح الصورة
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # 2. التنبؤ بنموذج الأسنان ونماذج الأمراض الأربعة
    res_t = model_teeth.predict(image, conf=0.3)[0]
    
    res_m1 = model_1.predict(image, conf=0.349)[0]
    res_m2 = model_2.predict(image, conf=0.580)[0]
    res_m3 = model_3.predict(image, conf=0.613)[0]
    res_m4 = model_4.predict(image, conf=0.532)[0]

    # استخراج صناديق الأسنان
    teeth_boxes = []
    if res_t.boxes:
        for b in res_t.boxes:
            x1, y1, x2, y2 = map(int, b.xyxy[0].tolist())
            name = res_t.names[int(b.cls[0])]
            teeth_boxes.append((x1, y1, x2, y2, name))

    # التعديل الجوهري: سنقوم بتخزين التيوبل (الصندوق، اسم المرض الصحيح)
    all_disease_boxes = []

    # تصفية النموذج الأول: يأخذ فقط Impacted
    if res_m1.boxes:
        for b in res_m1.boxes:
            name = res_m1.names[int(b.cls[0])]
            if name.lower() == "impacted":
                all_disease_boxes.append((b, name)) # تخزين الصندوق واسمه معاً

    # تصفية النموذج الثاني: يأخذ Crown و Bridge
    if res_m2.boxes:
        for b in res_m2.boxes:
            name = res_m2.names[int(b.cls[0])]
            if name.lower() in ["crown", "bridge"]:
                all_disease_boxes.append((b, name))

    # تصفية النموذج الثالث: يأخذ Implant و Braces
    if res_m3.boxes:
        for b in res_m3.boxes:
            name = res_m3.names[int(b.cls[0])]
            if name.lower() in ["implant", "braces"]:
                all_disease_boxes.append((b, name))

    # تصفية النموذج الرابع: يأخذ Caries, Filling, Root Canal
    if res_m4.boxes:
        for b in res_m4.boxes:
            name = res_m4.names[int(b.cls[0])]
            if name.lower() in ["caries", "filling", "root canal", "root_canal"]:
                all_disease_boxes.append((b, name))

    model_output = []
    draw = ImageDraw.Draw(image)
    
    # 3. مطابقة الأمراض بالأسنان 
    for d_box, dname in all_disease_boxes: # فك التوبل هنا للحصول على الاسم الصحيح فوراً
        dx1, dy1, dx2, dy2 = map(int, d_box.xyxy[0].tolist())
        
        matched_teeth_names = []
        matched_teeth_boxes = []
        
        overlap_threshold = 0.5

        for (tx1, ty1, tx2, ty2, tname) in teeth_boxes:
            ix1, iy1 = max(dx1, tx1), max(dy1, ty1)
            ix2, iy2 = min(dx2, tx2), min(dy2, ty2)
            
            iw, ih = ix2 - ix1, iy2 - iy1
            
            if iw > 0 and ih > 0:
                inter_area = iw * ih
                disease_area = (dx2 - dx1) * (dy2 - dy1)
                ratio = inter_area / float(disease_area)
                
                if ratio > overlap_threshold:
                    matched_teeth_names.append(tname)
                    matched_teeth_boxes.append((tx1, ty1, tx2, ty2))

        if matched_teeth_names:
            tooth_display_name = "-".join(matched_teeth_names)
            db_tooth_val = tooth_display_name 
            first_tooth_box = matched_teeth_boxes[0]
        else:
            tooth_display_name = "No Teeth"
            db_tooth_val = None
            first_tooth_box = None

        # --- الرسم على الصورة ---
        draw.rectangle([dx1, dy1, dx2, dy2], outline="red", width=3)
        label = f"{dname} ({tooth_display_name})"
        draw.text((dx1, dy1 - 15), label, fill="red")

        # الحفاظ على نفس هيكلية المخرجات للـ Backend دون أي تغيير
        model_output.append((
            dname, 
            db_tooth_val, 
            first_tooth_box,
            (dx1, dy1, dx2, dy2)
        ))

    # 4. حفظ الصورة باسم مميز
    temp_filename = f"analysed_{uuid.uuid4()}.png"
    save_path = os.path.join("static/temp", temp_filename)
    os.makedirs("static/temp", exist_ok=True)
    
    image.save(save_path)
    
    return model_output, save_path, temp_filename