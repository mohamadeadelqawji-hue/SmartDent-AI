import React, { useState } from 'react';

// --- الواجهات (Interfaces) ---
interface PatientTooth {
  tooth_name: string;
  finding_type: string;
}

interface ToothMapProps {
  teethData?: PatientTooth[];
}

// تحديث أنواع الحالات لتشمل الحالات السبع الجديدة بالإضافة للحالة السليمة
type ToothStatus = 'normal' | 'impacted' | 'implant' | 'braces' | 'crown' | 'bridge' | 'rct' | 'filling';

// --- أيقونات الأسنان الاحترافية المطورة لدعم الحالات السبع ---
const ProfessionalToothIcons = {
  normal: (color: string) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 2C15 2 14 3 12 3C10 3 9 2 6.5 2C4 2 3 4 3 7C3 9 4 11 5 13C5.5 14.5 5.5 17.5 7.5 20.5C8.5 22 10 22 11 20.5L12 18L13 20.5C14 22 15.5 22 16.5 20.5C18.5 17.5 18.5 14.5 19 13C20 11 21 9 21 7C21 4 20 2 17.5 2Z" 
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 6C7 6 9 4.5 12 4.5C15 4.5 17 6 17 6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  impacted: (color: string) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 2C15 2 14 3 12 3C10 3 9 2 6.5 2C4 2 3 4 3 7C3 9 4 11 5 13C5.5 14.5 5.5 17.5 7.5 20.5C8.5 22 10 22 11 20.5L12 18L13 20.5C14 22 15.5 22 16.5 20.5C18.5 17.5 18.5 14.5 19 13C20 11 21 9 21 7C21 4 20 2 17.5 2Z" 
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2"/>
      <path d="M8 12L12 16L16 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  implant: (color: string) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 4C5 3 6 2 8 2H16C18 2 19 3 19 4V7H5V4Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2"/>
      <path d="M12 7V21M9 11H15M10 15H14M11 19H13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  braces: (color: string) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 2C15 2 14 3 12 3C10 3 9 2 6.5 2C4 2 3 4 3 7C3 9 4 11 5 13C5.5 14.5 5.5 17.5 7.5 20.5C8.5 22 10 22 11 20.5L12 18L13 20.5C14 22 15.5 22 16.5 20.5C18.5 17.5 18.5 14.5 19 13C20 11 21 9 21 7C21 4 20 2 17.5 2Z" 
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 9H22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <rect x="5" y="7" width="3" height="4" rx="1" fill={color}/>
      <rect x="10" y="7" width="4" height="4" rx="1" fill={color}/>
      <rect x="16" y="7" width="3" height="4" rx="1" fill={color}/>
    </svg>
  ),
  crown: (color: string) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 2C15 2 14 3 12 3C10 3 9 2 6.5 2C4 2 3 4 3 7C3 9 4 11 5 13C5.5 14.5 5.5 17.5 7.5 20.5C8.5 22 10 22 11 20.5L12 18L13 20.5C14 22 15.5 22 16.5 20.5C18.5 17.5 18.5 14.5 19 13C20 11 21 9 21 7C21 4 20 2 17.5 2Z" 
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.2 7C3.2 4.5 4.5 2.5 6.5 2.5C9 2.5 10 3.5 12 3.5C14 3.5 15 2.5 17.5 2.5C19.5 2.5 20.8 4.5 20.8 7V9.5H3.2V7Z" 
        fill={color} fillOpacity="0.8"/>
      <path d="M7 9.5V7M12 9.5V7.5M17 9.5V7" stroke="white" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  bridge: (color: string) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4v10M20 4v10" stroke={color} strokeWidth="1.5"/>
      <path d="M2 10C2 6 6 5 12 5C18 5 22 6 22 10V14H2V10Z" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="1.5"/>
      <path d="M6 14v-4M12 14v-5M18 14v-4" stroke="white" strokeWidth="1.5"/>
    </svg>
  ),
  rct: (color: string) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 2C15 2 14 3 12 3C10 3 9 2 6.5 2C4 2 3 4 3 7C3 9 4 11 5 13C5.5 14.5 5.5 17.5 7.5 20.5C8.5 22 10 22 11 20.5L12 18L13 20.5C14 22 15.5 22 16.5 20.5C18.5 17.5 18.5 14.5 19 13C20 11 21 9 21 7C21 4 20 2 17.5 2Z" 
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 4c0 4-2 7-1.5 13M13.5 4c0 4 2 7 1.5 13" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    </svg>
  ),
  filling: (color: string) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 2C15 2 14 3 12 3C10 3 9 2 6.5 2C4 2 3 4 3 7C3 9 4 11 5 13C5.5 14.5 5.5 17.5 7.5 20.5C8.5 22 10 22 11 20.5L12 18L13 20.5C14 22 15.5 22 16.5 20.5C18.5 17.5 18.5 14.5 19 13C20 11 21 9 21 7C21 4 20 2 17.5 2Z" 
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 5C8 4 9.5 3.5 12 3.5C14.5 3.5 16 4 16 5V8C16 9.5 14.5 10.5 12 10.5C9.5 10.5 8 9.5 8 8V5Z" 
        fill={color} fillOpacity="0.7"/>
    </svg>
  )
};

const ToothMap: React.FC<ToothMapProps> = ({ teethData = [] }) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const getToothData = (num: number) => {
    const toothStr = num.toString();
    return teethData.find(t => 
      t.tooth_name === toothStr || t.tooth_name.split('-').includes(toothStr)
    );
  };

  // ربط مخرجات الـ API بتحديد نمط الأيقونة المستهدفة بدقة
  const getToothStatus = (num: number): ToothStatus => {
    const found = getToothData(num);
    if (!found) return 'normal';
    const type = found.finding_type.toLowerCase();
    
    if (type.includes('impacted')) return 'impacted';
    if (type.includes('implant')) return 'implant';
    if (type.includes('braces')) return 'braces';
    if (type.includes('crown') || type.includes('crow')) return 'crown';
    if (type.includes('bridge')) return 'bridge';
    if (type.includes('root canal') || type.includes('rct') || type.includes('treatment')) return 'rct';
    if (type.includes('filling')) return 'filling';
    
    return 'normal'; 
  };

  // تخصيص لون فريد ومميز لكل حالة من الحالات السبع
  const getToothColor = (num: number) => {
    const found = getToothData(num);
    if (!found) return '#22c55e'; // سليم - أخضر
    const type = found.finding_type.toLowerCase();
    
    if (type.includes('impacted')) return '#f97316';       // منطمر - برتقالي
    if (type.includes('implant')) return '#6366f1';        // زرعة - بنفسجي ناصع
    if (type.includes('braces')) return '#ec4899';         // تقويم - وردي
    if (type.includes('crown') || type.includes('crow')) return '#eab308'; // تاج - أصفر
    if (type.includes('bridge')) return '#a855f7';         // جسر - أرجواني
    if (type.includes('root canal') || type.includes('rct') || type.includes('treatment')) return '#06b6d4'; // علاج عصب - سماوي
    if (type.includes('filling')) return '#3b82f6';        // حشوة - أزرق
    
    return '#ef4444'; // افتراضي للأمراض الأخرى غير المصنفة
  };

  // مكون دليل الألوان (Legend) المطور والموسع ليعكس الحالات السبع بالتفصيل
  const Legend = () => (
    <div className="flex flex-wrap justify-center gap-4 mb-8 bg-white/50 p-4 rounded-2xl border border-slate-100">
      {[
        { label: 'سليم (Healthy)', color: '#22c55e' },
        { label: 'Impacted (منطمر)', color: '#f97316' },
        { label: 'Implant (زراعة)', color: '#6366f1' },
        
        { label: 'Crown (تاج)', color: '#eab308' },
        { label: 'Bridge (جسر)', color: '#a855f7' },
        { label: 'Root Canal (علاج عصب)', color: '#06b6d4' },
        { label: 'Filling (حشوة)', color: '#3b82f6' },
        { label: 'Caries (تسوس)', color: '#EF4545' },
      ].map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );

  const renderTeethRow = (range: number[], isUpper: boolean) => (
    <div className="flex justify-center gap-1 flex-wrap px-2">
      {range.map((num) => {
        const isSelected = selectedTooth === num;
        const status = getToothStatus(num);
        const color = getToothColor(num);

        return (
          <div
            key={num}
            onClick={() => setSelectedTooth(num)}
            className={`
              w-8 md:w-10 h-16 md:h-20 rounded-xl flex flex-col items-center justify-between py-2 cursor-pointer transition-all duration-200
              ${isSelected ? 'bg-white border-2 border-slate-800 scale-110 z-10 shadow-lg' : 'border border-transparent hover:bg-slate-50'}
              ${isUpper ? 'flex-col' : 'flex-col-reverse'}
            `}
          >
            <span className={`text-[9px] font-black ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{num}</span>
            <div className="w-5 h-7 md:w-6 md:h-8">
              {ProfessionalToothIcons[status](color)}
            </div>
            <div className="w-1 h-1 rounded-full" style={{backgroundColor: color}}></div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100" dir="rtl">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">مخطط الأسنان السريري الرقمي</h3>
        <p className="text-[11px] text-slate-400 font-bold mt-1 tracking-widest uppercase">FDI World Dental Federation System</p>
      </div>

      <Legend />

      <div className="space-y-8 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
        <div className="space-y-4">
          <p className="text-[8px] text-center font-black text-slate-300 uppercase tracking-widest">Upper Arch (الفك العلوي)</p>
          {renderTeethRow([28,27,26,25,24,23,22,21, 11,12,13,14,15,16,17,18], true)}
        </div>

        <div className="flex items-center gap-4 opacity-20">
          <div className="flex-1 h-px bg-slate-400"></div>
          <div className="w-2 h-2 border border-slate-400 rotate-45"></div>
          <div className="flex-1 h-px bg-slate-400"></div>
        </div>

        <div className="space-y-4">
          {renderTeethRow([38,37,36,35,34,33,32,31, 41,42,43,44,45,46,47,48], false)}
          <p className="text-[8px] text-center font-black text-slate-300 uppercase tracking-widest">Lower Arch (الفك السفلي)</p>
        </div>
      </div>

      {selectedTooth && (
        <div className="mt-8 flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-3">
                {ProfessionalToothIcons[getToothStatus(selectedTooth)](getToothColor(selectedTooth))}
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-lg">السن رقم {selectedTooth}</h4>
                <p className="text-xs text-slate-400 font-bold">
                  الحالة المكتشفة: 
                  <span className="mr-2 text-indigo-600 font-black">
                    {getToothData(selectedTooth)?.finding_type || 'سليم (Healthy)'}
                  </span>
                </p>
              </div>
           </div>
           
           <div className="hidden md:block">
              <span className="text-[10px] px-4 py-2 bg-slate-100 rounded-full font-black text-slate-400 uppercase">
                AI Diagnostic Mapping
              </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default ToothMap;