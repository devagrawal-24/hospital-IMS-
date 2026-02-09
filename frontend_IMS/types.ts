export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'STAFF';

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  password?: string; // Visible for admin in this demo
  department?: string;
  dailyWorkHoursLimit: number; // in hours
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  disease: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // ISO string or time string
  status: 'Waiting' | 'Examined' | 'Admitted' | 'Discharged';
  lastCheckup: string;
  assignedDoctorId?: string;
  notes: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medicine' | 'Equipment' | 'Consumable';
  quantity: number;
  minThreshold: number;
  unit: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  punchIn: string | null; // ISO string
  punchOut: string | null; // ISO string
  totalHours: number;
}

export interface Message {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: Role;
  toUserId: string; // 'ADMIN' for messages to admin, or specific userId
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
}