import { User, Patient, InventoryItem, AttendanceRecord } from './types';

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayStr = getTodayStr();

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Sarah Connor', role: 'ADMIN', username: 'admin', password: 'password123', dailyWorkHoursLimit: 8 },
  { id: 'u2', name: 'Dr. Gregory House', role: 'DOCTOR', username: 'doctor', password: 'password123', department: 'Diagnostics', dailyWorkHoursLimit: 8 },
  { id: 'u3', name: 'Nurse Joy', role: 'NURSE', username: 'nurse', password: 'password123', dailyWorkHoursLimit: 8 },
  { id: 'u4', name: 'John Smith', role: 'STAFF', username: 'staff', password: 'password123', dailyWorkHoursLimit: 9 },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Alice Johnson', age: 34, disease: 'Flu', appointmentDate: todayStr, appointmentTime: '09:00', status: 'Waiting', lastCheckup: '2023-10-20', assignedDoctorId: 'u2', notes: 'High fever reported.' },
  { id: 'p2', name: 'Bob Williams', age: 52, disease: 'Hypertension', appointmentDate: todayStr, appointmentTime: '10:30', status: 'Examined', lastCheckup: '2023-09-15', assignedDoctorId: 'u2', notes: 'Blood pressure check.' },
  { id: 'p3', name: 'Charlie Brown', age: 8, disease: 'Fracture', appointmentDate: todayStr, appointmentTime: '11:00', status: 'Admitted', lastCheckup: '2023-10-25', assignedDoctorId: 'u2', notes: 'Right arm cast check.' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Paracetamol 500mg', category: 'Medicine', quantity: 500, minThreshold: 100, unit: 'tablets' },
  { id: 'i2', name: 'Surgical Masks', category: 'Consumable', quantity: 50, minThreshold: 200, unit: 'boxes' },
  { id: 'i3', name: 'Stethoscope', category: 'Equipment', quantity: 12, minThreshold: 5, unit: 'units' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', userId: 'u2', date: todayStr, punchIn: new Date(new Date().setHours(8, 0)).toISOString(), punchOut: null, totalHours: 0 },
  { id: 'a2', userId: 'u3', date: todayStr, punchIn: new Date(new Date().setHours(7, 30)).toISOString(), punchOut: new Date(new Date().setHours(17, 30)).toISOString(), totalHours: 10 }, // Overtime example
  { id: 'a3', userId: 'u4', date: todayStr, punchIn: null, punchOut: null, totalHours: 0 },
];