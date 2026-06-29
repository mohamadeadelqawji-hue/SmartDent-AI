import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

// تعريف واجهة البيانات القادمة من الباك إيند
interface PatientAppointment {
  id: number;
  name: string;
  age: number;
  phone: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const navigate = useNavigate();

  // جلب البيانات من الباك إيند عند تحميل الصفحة
  useEffect(() => {
    const fetchAppointments = async () => {
      // الحصول على التوكن من localStorage
      const token = localStorage.getItem('token');

      // إذا لم يوجد توكن، يتم التوجيه لصفحة تسجيل الدخول فوراً
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // إرسال طلب GET مع ترويسة المصادقة
        const response = await axios.get('http://127.0.0.1:8000/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setAppointments(response.data);
      } catch (error: any) {
        console.error("Fetch Error:", error);
        
        // التعامل مع انتهاء صلاحية الجلسة (401)
        if (error.response?.status === 401) {
          localStorage.removeItem('token'); // مسح التوكن المنتهي
          navigate('/login');
        } else {
          setToast({ 
            message: "فشل الاتصال بالخادم، تأكد من تشغيل الباك إيند وصلاحية الدخول", 
            type: 'error' 
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // تنسيق تاريخ اليوم بالعربي
  const todayDate = useMemo(() => {
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-10 px-4" dir="rtl">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* الهيدر */}
      <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-deep-teal">جدول المواعيد</h2>
          <p className="text-primary font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            مواعيد اليوم: {todayDate}
          </p>
        </div>
        <div className="text-left">
          <span className="text-xs font-black text-slate-400 block uppercase">إجمالي الحضور</span>
          <span className="text-2xl font-black text-deep-teal">{appointments.length}</span>
        </div>
      </div>

      {/* حاوية الجدول */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-y-auto max-h-[550px] custom-scrollbar">
          {loading ? (
            <div className="p-20 text-center text-slate-400 font-bold animate-pulse">
              جاري جلب البيانات المؤمنة من السيرفر...
            </div>
          ) : (
            <table className="w-full text-right border-collapse sticky-header">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-xs font-black text-slate-400">#</th>
                  <th className="p-4 text-xs font-black text-slate-400">اسم المريض</th>
                  <th className="p-4 text-xs font-black text-slate-400 text-center">العمر</th>
                  <th className="p-4 text-xs font-black text-slate-400 text-center">رقم الموبايل</th>
                  <th className="p-4 text-xs font-black text-slate-400 text-center">الحالة</th>
                  <th className="p-4 text-xs font-black text-slate-400 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-400">{apt.id}</span>
                      </td>
                      <td className="p-4 font-extrabold text-deep-teal">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">
                            {apt.name.charAt(0)}
                          </div>
                          {apt.name}
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-600 text-sm">
                        {apt.age} سنة
                      </td>
                      <td className="p-4 text-center font-mono text-sm text-slate-500">
                        {apt.phone}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-600">
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => navigate(`/patients/${apt.id}`)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-green-500 transition-colors flex items-center justify-center"
                            title="عرض الملف الطبي"
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-300 font-bold">
                      لا يوجد مواعيد مسجلة لهذا اليوم
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .sticky-header th { box-shadow: inset 0 -1px 0 #e2e8f0; }
      `}</style>
    </div>
  );
};

export default Dashboard;