import React from 'react';
import { useLocation } from 'react-router-dom';

interface TopBarProps {
  onLogout?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout }) => {
  const location = useLocation();
  
  // ✅ نقل القراءة داخل المكون حتى تتحديث مع كل إعادة تصيير
  const role = localStorage.getItem('role');
  console.log("ff", role);
  
  const is_doctor = role === "doctor";
  const is_sec = role === "secretary";
  
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        {is_doctor && (
          <h2 className="text-xl font-bold text-slate-800">أهلا بك دكتور أحمد</h2>
        )}
        {is_sec && (
          <h2 className="text-xl font-bold text-slate-800">أهلا بك موظف محمد</h2>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={onLogout}
            className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden ml-2 border border-slate-200">
            <img src="https://picsum.photos/seed/doctor/200/200" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;