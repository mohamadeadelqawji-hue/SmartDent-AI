from sqlmodel import SQLModel,select,create_engine,Session,Field
from data_user import User
from fastapi import HTTPException
class Visite(SQLModel,table=True):
  id:int|None=Field(default=None,primary_key=True)
  data_time:str=Field(index=True)
  user_id:int|None=Field(default=None,foreign_key="user.id")

sqlite_url='postgresql://postgres:0945180265Adel@localhost:5432/QuizApplicationYT'
enginer=create_engine(sqlite_url,echo=True);
def creat_db():
  SQLModel.metadata.create_all(enginer);

def creat_table(x,y):
  with Session(enginer) as session:
    from data_time import invalidate_appointments_cache
    visite_1=Visite(data_time=x,user_id=y);
    session.add(visite_1);
    session.commit();
    invalidate_appointments_cache()
    return True

def getallvisite():
  with Session(enginer) as session:
    data=select(Visite);
    result=session.exec(data).all();
    print(result)
    return result
def get_all_visite_to_user(id_user:int):
  with Session(enginer) as session:
    data=select(Visite).where(Visite.user_id==id_user);
    result=session.exec(data).all();

    return result;
def get_all_images_to_visite(id_visite:int):
  with Session(enginer) as session:
    from data_image import DentalImage
    
    data=select(DentalImage).where(DentalImage.visit_id==id_visite);
    result=session.exec(data).all();
    return result;

def update_visite_data(visite_id: int, update_data: dict):
    with Session(enginer) as session:
        # 1. جلب الزيارة من قاعدة البيانات
        statement = select(Visite).where(Visite.id == visite_id)
        visite_record = session.exec(statement).first()
        
        if not visite_record:
            return None
        
        # 2. تحديث الحقول المسموحة ديناميكياً (مثل data_time)
        for key, value in update_data.items():
            if value == "string" or value == "" or value is None:
                continue
            setattr(visite_record, key, value)
            
        # 3. حفظ التعديل وإبطال الكاش لتحديث السجلات في الداشبورد فوراً
        session.add(visite_record)
        session.commit()
        session.refresh(visite_record)
        
        from data_time import invalidate_appointments_cache
        invalidate_appointments_cache()
        
        return visite_record


  
#Delete 
def delete_visite_id(id_visite: int, session: Session):
    statement = select(Visite).where(Visite.id == id_visite)
    result = session.exec(statement).first()
    
    if result:
        session.delete(result)
    else:
        raise HTTPException(status_code=404, detail="الزيارة غير موجودة")

# الدالة الكبرى
def delete_all_images_to_visite_and_ill(id_visite: int):
    # نفتح جلسة واحدة فقط لكل العملية
    with Session(enginer) as session:
        from data_image import DentalImage, delete_image
        from data_time import invalidate_appointments_cache
        
        
        # 1. جلب معرفات الصور المرتبطة بالزيارة
        statement = select(DentalImage.id).where(DentalImage.visit_id == id_visite)
        image_ids = session.exec(statement).all()
        
        try:
            # 2. حذف الصور (الفيزيائية ومن قاعدة البيانات)
            if image_ids:
                for img_id in image_ids:
                    # تأكد أن delete_image داخل ملفها تستخدم نفس المنطق أو تقبل الجلسة
                    delete_image(id=img_id)
            
            # 3. حذف الزيارة نفسها (نمرر الجلسة الحالية)
            delete_visite_id(id_visite=id_visite, session=session)
            
            # 4. حفظ كل التغييرات مرة واحدة
            session.commit()
            invalidate_appointments_cache()
            return True
            
        except Exception as e:
            session.rollback() # تراجع عن كل شيء في حال حدوث أي خطأ
            print(f"Error during deletion: {e}")
            raise HTTPException(status_code=500, detail="فشلت عملية الحذف الشاملة")
def main():
  creat_db();
  # creat_table();
  # getallvisite()
  # get_all_visite_to_user(id_user=1)


if __name__=="__main__":
  main();