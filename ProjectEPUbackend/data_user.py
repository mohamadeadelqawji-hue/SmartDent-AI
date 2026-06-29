from unittest import result
from sqlalchemy.orm import session
from sqlalchemy.sql.functions import user
from sqlmodel import SQLModel,select,create_engine,Session,Field,func
from fastapi import HTTPException
import json
class User(SQLModel,table=True):
  __table_args__ = {'extend_existing': True}
  id:int|None=Field(default=None,primary_key=True);
  name:str
  age:int=Field(gt=0, le=80)
  phone:str|None=Field(max_length=10)

sqlite_url='postgresql://postgres:0945180265Adel@localhost:5432/QuizApplicationYT'
enginer=create_engine(sqlite_url,echo=True);

def creat_db():
  SQLModel.metadata.create_all(enginer);
def creat_table(x,y,phone):
  with Session(enginer) as session:
    user_1=User(name=x,age=y,phone=phone);
    session.add(user_1)
    session.commit()
def getall_users():
  with Session(enginer) as session:
    data=select(User);
    result=session.exec(data).all();
    return result

def getone_user(id:int):
  with Session(enginer) as session:
    data=select(User).where(User.id==id);
    result=session.exec(data).one();
    return result;
  
def delete_user(id:int):
  with Session(enginer) as session:
    
    data= select(User).where(User.id==id);
    result=session.exec(data).one();
    session.delete(result);
    session.commit();
    return True

def delete_user_and_visite_and_image_and_ill_full_delete(id_user):

  with Session(enginer) as session:
          from data_time import invalidate_appointments_cache
          
          from data_visite import Visite, delete_all_images_to_visite_and_ill
          
          try:
              # الخطوة 1: جلب كل زيارات المريض
              statement = select(Visite.id).where(Visite.user_id == id_user)
              visit_ids = session.exec(statement).all()
              
              # الخطوة 2: تدمير كل زيارة بملحقاتها (صور وأمراض)
              if visit_ids:
                  for v_id in visit_ids:
                      # استدعاء دالتك التي تحذف الصور والزيارة نفسها
                      delete_all_images_to_visite_and_ill(id_visite=v_id)

              # الخطوة 3: الآن أصبح المريض بلا زيارات، يمكننا حذفه بأمان
              user_statement = select(User).where(User.id == id_user)
              user_result = session.exec(user_statement).first()
              
              if user_result:
                  session.delete(user_result)
                  
              # الخطوة 4: تثبيت العملية الكبرى
              session.commit()
              invalidate_appointments_cache()
              
              return True

          except Exception as e:
              session.rollback()
              print(f"Error deleting user and everything: {e}")
              raise HTTPException(status_code=500, detail="فشل الحذف الكامل للمريض")



# def get_total_diseases_for_patient(id_user: int):
#     # استيراد داخلي لكسر الحلقة الدائرية
#     from data_visite import Visite
#     from data_image import DentalImage
#     from data_patienttooth import PatientTooth
#     from sqlmodel import Session, select, func

#     with Session(enginer) as session:
#         statement = (
#             select(func.count(PatientTooth.id))
#             .join(DentalImage, PatientTooth.image_id == DentalImage.id) # الربط الصحيح: image_id
#             .join(Visite, DentalImage.visit_id == Visite.id)
#             .where(Visite.user_id == id_user)
#         )
        
#         result = session.exec(statement).one()
#         print("ade===================================")
#         print(result)
#         return result
out=[
  {
    "visit_id": 46,
    "date": "2026-04-28",
    "images": [
      {
        "image_id": 84,
        "image_path": "static/temp\\analysed_f4df73a9-66e5-4a13-8067-5ebd492f9c65.png",
        "diseases": [
          {
            "tooth_number": "Unknown",
            "finding": "Crown"
          },
          {
            "tooth_number": "17",
            "finding": "Filling"
          },
          {
            "tooth_number": "45",
            "finding": "Crown"
          },
          {
            "tooth_number": "17",
            "finding": "Filling"
          }
        ]
      },
      {
        "image_id": 89,
        "image_path": "static/temp\\analysed_49e92d07-256c-44fd-96e6-9d984a429cd9.png",
        "diseases": [
          {
            "tooth_number": "28",
            "finding": "Impacted"
          },
          {
            "tooth_number": "48",
            "finding": "Impacted"
          },
          {
            "tooth_number": "18",
            "finding": "Impacted"
          },
          {
            "tooth_number": "38",
            "finding": "Impacted"
          },
          {
            "tooth_number": "26",
            "finding": "Caries"
          }
        ]
      }
    ]
  },
  {
    "visit_id": 47,
    "date": "2026-05-02",
    "images": [
      {
        "image_id": 86,
        "image_path": "static/temp\\analysed_19af90aa-8d3a-40ef-aa3f-ea215272ad3b.png",
        "diseases": [
          {
            "tooth_number": "46-47",
            "finding": "Filling"
          },
          {
            "tooth_number": "37-36",
            "finding": "Filling"
          }
        ]
      }
    ]
  },
  {
    "visit_id": 48,
    "date": "2026-05-03",
    "images": []
  }
]
def update_user_data(user_id: int, update_data: dict):
    with Session(enginer) as session:
        # 1. جلب المريض من قاعدة البيانات بواسطة الـ ID
        statement = select(User).where(User.id == user_id)
        user_record = session.exec(statement).first()
        
        if not user_record:
            return None
        
        # 2. المرور فقط على الحقول التي تم تعديلها فعلياً وتحديثها ديناميكياً
        for key, value in update_data.items():
            # التحقق الإضافي لضمان عدم تمرير نصوص افتراضية من الـ Swagger مثل "string"
            if value == "string" or value == "":
                continue
            setattr(user_record, key, value)
            
        # 3. حفظ التعديلات في قاعدة البيانات
        session.add(user_record)
        session.commit()
        session.refresh(user_record)
        return user_record

    
def get_detailed_patient_report(id_user: int):
    # استيراد داخلي لكسر الحلقة الدائرية (Circular Dependency)
    from data_visite import Visite
    from data_image import DentalImage
    from data_patienttooth import PatientTooth

    with Session(enginer) as session:
        # بناء استعلام واحد لربط الجداول الثلاثة بكفاءة عالية
        statement = (
            select(Visite, DentalImage, PatientTooth)
            .join(DentalImage, Visite.id == DentalImage.visit_id, isouter=True)
            .join(PatientTooth, DentalImage.id == PatientTooth.image_id, isouter=True)
            .where(Visite.user_id == id_user)
        )
        results = session.exec(statement).all()

        visites_map = {}

        for visite, image, tooth in results:
            # 1. تنظيم وتجميع الزيارات في الذاكرة بـ O(1) Lookup
            if visite.id not in visites_map:
                visites_map[visite.id] = {
                    "visit_id": visite.id,
                    "date": visite.data_time,
                    "images": {}
                }

            # 2. تنظيم الصور وتفادي التكرار الناجم عن الـ Join
            if image:
                if image.id not in visites_map[visite.id]["images"]:
                    visites_map[visite.id]["images"][image.id] = {
                        "image_id": image.id,
                        "image_path": image.file_path,
                        "diseases": []
                    }

                # 3. تنظيم المكتشفات الطبية وأرقام الأسنان وإحداثيات الصناديق
                if tooth:
                    # تحويل النص [xmin, ymin, xmax, ymax] إلى مصفوفة حقيقية لتسهيل الرسم في الفرونت إند
                    bbox_list = []
                    if tooth.defect_bbox:
                        try:
                            # تحويل النص المسترجع من قاعدة البيانات إلى List
                            bbox_list = json.loads(tooth.defect_bbox)
                        except Exception:
                            bbox_list = tooth.defect_bbox  # في حال كان مخزناً كـ list بالفعل
                    
                    visites_map[visite.id]["images"][image.id]["diseases"].append({
                        "tooth_number": tooth.tooth_name,
                        "finding": tooth.finding_type,
                        "defect_bbox": bbox_list
                    })

        # تحويل القواميس المؤقتة (Dicts) إلى مصفوفات (Arrays) لراحة التعامل في React
        final_output = []
        for v_id, v_data in visites_map.items():
            v_data["images"] = list(v_data["images"].values())
            final_output.append(v_data)

        return final_output
def main():
  creat_db();
  # get_total_diseases_for_patient(22);
  get_detailed_patient_report(22);
  
  
  
if __name__=="__main__":
  main();