import React from 'react';
import ToothMap from './ToothMap';

interface PatientTooth {
  tooth_name: string;
  finding_type: string;
}

interface Props {
  teethData?: PatientTooth[];
}

const ToothMapAll: React.FC<Props> = ({ teethData = [] }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      {/* العناوين كما هي */}
      <div className="flex items-center gap-3 mb-10 border-r-4 border-primary pr-4">
        <div>
          <h3 className="text-2xl font-extrabold text-deep-teal">خريطة الأسنان التفاعلية</h3>
          <p className="text-sm text-slate-400 font-bold mt-1">تتبع حالة كل سن بشكل مستقل</p>
        </div>
      </div>
      <div className="bg-slate-50/50 rounded-[2rem] p-4 md:p-10 border border-slate-100">
        {/* التعديل: تمرير البيانات للمكون الداخلي */}
        <ToothMap teethData={teethData} />
      </div>
    </div>
  );
};

export default ToothMapAll;