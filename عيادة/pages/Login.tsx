import React, { useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState(''); // تم التغيير من email إلى username
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // إعداد البيانات بصيغة x-www-form-urlencoded لتطابق طلب الـ cURL
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', username);
      params.append('password', password);
      params.append('scope', '');
      params.append('client_id', 'string');
      params.append('client_secret', 'string');

      const response = await axios.post('http://127.0.0.1:8000/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'application/json'
        }
      });

      // تخزين البيانات القادمة من السيرفر (access_token و role)
      localStorage.setItem('token', response.data.access_token);
      const token = response.data.access_token;
const base64Url = token.split('.')[1]; // نأخذ الجزء الأوسط من التوكن
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const payload = JSON.parse(window.atob(base64)); // فك التشفير وتحويله لـ JSON

// 3. تخزين الرتبة الصافية الآن
localStorage.setItem('role', payload.role);
      // localStorage.setItem('role', response.data.role); // سيخزن 'doctor' بناءً على رد السيرفر

      onLogin(); 
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.response && error.response.status === 401) {
        setToast('خطأ في اسم المستخدم أو كلمة المرور');
      } else {
        setToast('فشل الاتصال بالسيرفر، تأكد من تشغيل الباك إيند');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f4] relative overflow-hidden font-sans">
      {toast && <Toast message={toast} type="error" onClose={() => setToast(null)} />}
      
      {/* عناصر زخرفية - لم تتغير */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-deep-teal/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden z-10 m-4 border border-white/20">
        
        {/* الجانب الأيمن - لم يتغير */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-deep-teal to-primary opacity-90"></div>
          <img 
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            alt="Dental Clinic"
          />
          <div className="relative z-10 text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30">
              <span className="material-symbols-outlined text-4xl">dentistry</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">مرحباً بك في <br/>نظام عيادة السن الذكي</h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-md">
              المنصة المتكاملة لإدارة عيادتك بكفاءة عالية باستخدام تقنيات الذكاء الاصطناعي والتحليلات المتقدمة.
            </p>
          </div>
        </div>

        {/* الجانب الأيسر - تعديل حقل الإدخال ليكون اسم المستخدم */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">dentistry</span>
            </div>
            <h1 className="font-bold text-xl text-deep-teal">عيادة السن</h1>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-extrabold text-slate-800 mb-2">تسجيل الدخول</h3>
            <p className="text-slate-500">أدخل بيانات الحساب للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block mr-1">اسم المستخدم</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder=""
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block mr-1">كلمة المرور</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder=""
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-deep-teal text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <span className="material-symbols-outlined">arrow_back</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;