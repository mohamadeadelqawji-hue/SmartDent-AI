import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  // تعريف الـ State لتخزين دور المستخدم الحالي
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // جلب الدور من الـ localStorage عند تحميل الكومبوننت
    const userRole = localStorage.getItem('role');
    setRole(userRole);
  }, []); // مصفوفة فارغة ليعمل فقط مرة واحدة عند تحميل الكومبوننت

  // تحديد من هو المستخدم بناءً على الـ State
  const isDoctor = role === 'doctor';
  const isSecretary = role === 'secretary';

  const navItems = [
    { name: 'الرئيسية', icon: 'dashboard', path: '/' },
    { name: 'المرضى', icon: 'group', path: '/patients' },
    { name: 'المواعيد', icon: 'calendar_today', path: '/appointments' },
    // { name: 'تحليل الذكاء الاصطناعي', icon: 'psychology', path: '/ai-analysis' },
    // { name: 'الفواتير', icon: 'payments', path: '/billing' },
  ];

  return (
    <aside className="w-64 bg-white border-l border-slate-200 hidden md:flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">dentistry</span>
        </div>
        <div>
          <h1 className="font-bold text-lg text-deep-teal leading-none"> Smart Dent AI</h1>
          <span className="text-xs text-slate-500">  نظام التشخيص الذكي</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>تسجيل الخروج</span>
        </button>
        
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
          <img
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover"
            src="https://picsum.photos/seed/doctor/200/200"
          />
          <div className="overflow-hidden">
            {/* عرض اسم الطبيب فقط إذا كان طبيباً */}
            {isDoctor && <p className="text-sm font-bold truncate">د. أحمد الأحمد</p>} 
            {/* عرض اسم السكرتير فقط إذا كان سكرتيراً */}
            {isSecretary && <p className="text-sm font-bold truncate">محمد عبد الله</p>} 
            
            <p className="text-xs text-slate-500"> 
              {isDoctor && "أخصائي أسنان"} 
              {isSecretary && "سكرتير"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;