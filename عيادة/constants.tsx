
import React from 'react';
import { Patient, Appointment } from './types';

export const PATIENTS: Patient[] = [
  {
    id: "PT-8821",
    name: " عادل قاوجي",
    age: 34,
    bloodType: "O+",
    phone: "+966 50 123 4567",
    email: "ahmed.m@example.com",
    lastVisit: "2023-10-12",
    nextVisit: "2023-11-05",
    status: "قيد العلاج",
    doctor: "د. إلينا",
    avatar: "C:\Users\User\Desktop\photo_2024-08-22_10-35-26.jpg"
  },
  {
    id: "PT-9102",
    name: "ليلى حسان",
    age: 28,
    bloodType: "A-",
    phone: "+966 50 765 4321",
    email: "laila.h@mail.com",
    lastVisit: "2023-09-28",
    nextVisit: "2023-11-10",
    status: "قائمة الانتظار",
    doctor: "د. ماركوس",
    avatar: "https://picsum.photos/seed/p2/200/200"
  },
  {
    id: "PT-7743",
    name: "عمر زايد",
    age: 45,
    bloodType: "B+",
    phone: "+966 55 987 6543",
    email: "omar.z@provider.net",
    lastVisit: "2023-10-20",
    nextVisit: "2023-11-15",
    status: "مكتمل",
    doctor: "د. إلينا",
    avatar: "https://picsum.photos/seed/p3/200/200"
  }
];

export const DAILY_APPOINTMENTS: Appointment[] = [
  {
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },{
    id: "APT-001",
    time: "09:00",
    period: "صباحاً",
    patientName: "أحمد علي",
    treatment: "علاج عصب - الغرفة 02",
    room: "02",
    status: "قيد الانتظار",
    color: "blue"
  },
  {
    id: "APT-002",
    time: "10:30",
    period: "صباحاً",
    patientName: "سارة سميث",
    treatment: "فحص دوري - الغرفة 01",
    room: "01",
    status: "جاهز",
    color: "green"
  },
  {
    id: "APT-003",
    time: "01:00",
    period: "مساءً",
    patientName: "محمد عمر",
    treatment: "تقويم أسنان - الغرفة 04",
    room: "04",
    status: "لاحقاً",
    color: "purple"
  }
];
