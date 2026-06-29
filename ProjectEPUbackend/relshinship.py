
from sqlmodel import Session,create_engine,select
from data_user import User
from data_visite import Visite
sqlite_url='postgresql://postgres:0945180265Adel@localhost:5432/QuizApplicationYT'
enginer=create_engine(sqlite_url,echo=True)
def creatrelshinship():
  with  Session(enginer) as session:

        statement = select(User, Visite).where(User.id == Visite.user_id)
        results = session.exec(statement)
        grouped_data = {}

        for user, visite in results:
            if user.id not in grouped_data:
                grouped_data[user.id] = {
                    "user_id": user.id,
                    "user_name": user.name,
                    "visites": []
                }
            
            # هنا السحر: رقم الزيارة هو ببساطة (عدد الزيارات المضافة حالياً + 1)
            visit_count = len(grouped_data[user.id]["visites"]) + 1
            
            grouped_data[user.id]["visites"].append({
                "visit_number": visit_count, # قاعدة البيانات عرفت الترتيب تلقائياً هنا
                "visit_id": visite.id,
                "data_time": visite.data_time
            })
        
        return list(grouped_data.values())
def main():
  creatrelshinship();
  
if __name__ =="__main__":
  main();
  
