from sqlmodel import Field, select,create_engine,Session,SQLModel
import os
from pathlib import Path
from data_visite import Visite

BASE_DIR = r"C:\Users\User\Desktop\copyScurite\ProjectEPUbackend\static\temp"

class DentalImage(SQLModel,table=True):
  id:int|None=Field(default=None,primary_key=True);
  file_path:str
  image_type:str=Field(default="X-ray");

  doctor_notes:str|None
  created_at_time:str
  visit_id: int = Field(foreign_key="visite.id")
  
sqlite_url='postgresql://postgres:0945180265Adel@localhost:5432/QuizApplicationYT'
enginger=create_engine(sqlite_url,echo=True);
def creat_db():
  SQLModel.metadata.create_all(enginger);

def creat_image_table(file_path,image_type,created_at_time,visit_id,doctor_notes=""):
  with Session(enginger) as session:
    image_1=DentalImage(file_path=file_path,image_type=image_type,
                      doctor_notes=doctor_notes,created_at_time=created_at_time,visit_id=visit_id)
    session.add(image_1);
    session.commit();
    session.refresh(image_1)
    return image_1
def get_image_prediction(id:int):
  with Session(enginger) as session:
    data=select(DentalImage).where(DentalImage.visit_id==id)
    result=session.exec(data).all();

    return result

def update_doctor_notes(image_id: int, notes: str):
    with Session(enginger) as session:
        # 1. جلب سجل الصورة من قاعدة البيانات بواسطة الـ ID
        statement = select(DentalImage).where(DentalImage.id == image_id)
        image_record = session.exec(statement).first()
        
        if not image_record:
            return None # الصورة غير موجودة
        
        # 2. تحديث حقل الملاحظات فقط، وباقي الحقول (مثل المسار ونوع الصورة والزيارة) تظل كما هي تماماً
        image_record.doctor_notes = notes
        
        # 3. حفظ التعديل في قاعدة البيانات
        session.add(image_record)
        session.commit()
        session.refresh(image_record)
        return image_record


def delete_image(id: int):
    with Session(enginger) as session:
        from data_patienttooth import PatientTooth 
        
        # 1. جلب سجل الصورة
        data = select(DentalImage).where(DentalImage.id == id)
        result = session.exec(data).first()
        
        if not result:
            return False

        # 2. حذف السجلات المرتبطة من جدول الأمراض أولاً
        statement = select(PatientTooth).where(PatientTooth.image_id == id)
        diseases = session.exec(statement).all()
        for disease in diseases:
            session.delete(disease)
        
        # تنفيذ الحذف الأولي في قاعدة البيانات
        session.flush() 

        # 3. حذف الملف الفيزيائي من القرص الصلب
        file_path = Path(BASE_DIR) / os.path.basename(result.file_path)
        try:
            if file_path.exists():
                os.remove(file_path)
        except Exception as e:
            print(f"File delete error: {e}")

        # 4. حذف سجل الصورة الآن (بعد حذف التوابع)
        session.delete(result)
        
        # 5. حفظ كل التغييرات نهائياً
        session.commit()
        return True
def main():
  creat_db();


if __name__=="__main__":
  main()
