
export interface Patient {
  id: string;
  name: string;
  age: number;
  bloodType: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextVisit: string;
  status: 'قيد العلاج' | 'مكتمل' | 'قائمة الانتظار';
  doctor: string;
  avatar: string;
}

export interface Appointment {
  id: string;
  time: string;
  period: string;
  patientName: string;
  treatment: string;
  room: string;
  status: 'قيد الانتظار' | 'جاهز' | 'لاحقاً';
  color: string;
}

export interface TreatmentStep {
  date: string;
  title: string;
  description: string;
  doctor: string;
  status: 'مكتمل' | 'قيد التنفيذ' | 'مخطط له';
}
