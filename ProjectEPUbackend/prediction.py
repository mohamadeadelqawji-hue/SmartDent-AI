from fastapi import APIRouter, File, UploadFile,Body,Depends
from AI_prediction import run_yolo_prediction
from data_image import creat_image_table,delete_image,get_image_prediction
from AI_prediction_dupel import run_yolo_prediction
from datetime import datetime
import json
from data_patienttooth import  creat_table_pattienttooth
from auth_utils import role_doctor_required
from pydantic import BaseModel
class NotesUpdate(BaseModel):
    doctor_notes: str

# ثانياً: استيراد الدالة الجديدة من ملف الداتا الخاص بالصور
from data_image import update_doctor_notes
from fastapi import HTTPException

router_prediction = APIRouter( tags=["AI Predictions"])
@router_prediction.get("/prediction")
async def get_prediction(id_visite:int,admin:dict=Depends(role_doctor_required)):
  return get_image_prediction(id_visite)



@router_prediction.post("/prediction") 
async def predict_endpoint(visite_id: int, file: UploadFile = File(...),admin:dict=Depends(role_doctor_required)):
    contents = await file.read()
    result = run_yolo_prediction(contents)
    
    # 2. استخراج البيانات من الخرج
    all_preds = result.get("all_predictions", [])
    image_url = result.get("temp_filename", "")
    
    # نحدد أعلى نتيجة كعنوان رئيسي للجدول
    if all_preds:
        best_pred = max(all_preds, key=lambda x: x["confidence"])
        top_label = best_pred["label"]
        top_conf = best_pred["confidence"]
    else:
        top_label = "None"
        top_conf = 0.0

    # 3. تحويل "كل القيم" إلى نص JSON لتخزينها في حقل الملاحظات
    # هذا يضمن عدم ضياع أي توقع من القائمة
    all_results_as_text = json.dumps(all_preds, ensure_ascii=False)

    # 4. تصحيح سطر 14 (تمرير كافة القيم للدالة)
    creat_image_table(
        file_path=image_url,
        doctor_notes="",
        image_type="X-ray",created_at_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        visit_id=visite_id
    )
    
    return all_results_as_text
  
@router_prediction.post("/predictionDupple")
async def predictionDupple(visite_id=int,file:UploadFile=File(...),admin:dict=Depends(role_doctor_required)):
  file_bytes = await file.read()
  model_output, save_path, temp_filename=run_yolo_prediction(file_bytes);
  new_image=creat_image_table(
        file_path=save_path,
        doctor_notes="",
        image_type="X-ray",created_at_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        visit_id=visite_id
    );
  if new_image and hasattr(new_image, 'id'): 
    image_id = new_image.id
    creat_table_pattienttooth(image_id=image_id, model_result=model_output)
  
  return model_output, save_path, temp_filename

@router_prediction.put("/prediction/{image_id}/notes")
async def add_doctor_notes(image_id: int, payload: NotesUpdate, admin: dict = Depends(role_doctor_required)):
    # التحقق من أن الطبيب لم يرسل نصاً فارغاً تماماً أو القيمة الافتراضية للـ Swagger
    if payload.doctor_notes == "string" or payload.doctor_notes.strip() == "":
        raise HTTPException(status_code=400, detail="الرجاء كتابة ملاحظة صالحة")
        
    # استدعاء دالة التحديث
    updated_image = update_doctor_notes(image_id=image_id, notes=payload.doctor_notes)
    
    if not updated_image:
        raise HTTPException(status_code=404, detail="الصورة الطبية المطلوبة غير موجودة")
        
    return {
        "status": "success",
        "message": "تم حفظ ملاحظات الدكتور بنجاح والحفاظ على كافة بيانات الصورة الأخرى",
        "image": {
            "id": updated_image.id,
            "file_path": updated_image.file_path,
            "image_type": updated_image.image_type,
            "visit_id": updated_image.visit_id,
            "created_at_time": updated_image.created_at_time,
            "doctor_notes": updated_image.doctor_notes # ستظهر الملاحظة الجديدة هنا
        }
    }


@router_prediction.delete("/prediction/{id}")
async def delete_image_id(id:int,admin:dict=Depends(role_doctor_required))->bool:
   return delete_image(id)
