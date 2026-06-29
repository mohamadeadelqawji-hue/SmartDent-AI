from datetime import date
from sqlmodel import select, Session,create_engine
from sqlalchemy import and_
from data_user import User
import time
  
sqlite_url='postgresql://postgres:0945180265Adel@localhost:5432/QuizApplicationYT'
enginger=create_engine(sqlite_url,echo=False);

_cache = {
    "data": None,
    "last_updated": 0,
    "date": None
}
CACHE_DURATION = 5 * 60 * 60  # 5 ساعات بالثواني

def get_today_appointments_optimized():
    global _cache
    now = time.time()
    today_str = date.today().strftime("%Y-%m-%d")

    # 1. هل البيانات موجودة في الكاش؟ وهل هي لنفس اليوم؟ وهل لم تنتهِ الـ 5 ساعات؟
    if (_cache["data"] is not None and 
        _cache["date"] == today_str and 
        (now - _cache["last_updated"]) < CACHE_DURATION):
        print("🚀 استجابة سريعة من الكاش...")
        return _cache["data"]

    # 2. إذا لم يوجد كاش، نذهب لقاعدة البيانات
    print("📡 جلب من قاعدة البيانات (5 مليون سجل)...")
    from data_visite import Visite
    
    with Session(enginger) as session:
        statement = (
            select(User.id, User.name, User.age, User.phone)
            .join(Visite, User.id == Visite.user_id)
            .where(Visite.data_time == today_str)
        )
        results = session.exec(statement).all()

        final_data = [
            {
                "id": r.id,
                "name": r.name,
                "age": r.age,
                "phone": r.phone,
                "status": "قيد الانتظار"
            }
            for r in results
        ]

        # 3. تحديث الكاش بالبيانات الجديدة
        _cache["data"] = final_data
        _cache["last_updated"] = now
        _cache["date"] = today_str

        return final_data
      
def invalidate_appointments_cache():
    global _cache
    _cache["data"] = None
    print("🧹 تم مسح الكاش، سيتم التحديث في الطلب القادم.")