export type UserRole = 
  | 'Super Admin' 
  | 'Franchise Admin'
  | 'Admin' 
  | 'Principal' 
  | 'HOD' 
  | 'Teacher' 
  | 'Accountant' 
  | 'Data Entry' 
  | 'Support' 
  | 'Parent' 
  | 'Student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  phone?: string;
}

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  neutral?: boolean;
  subtext: string;
  iconName: string;
  color: 'blue' | 'purple' | 'emerald' | 'amber' | 'indigo' | 'rose';
}

export interface AttendanceRecord {
  name: string;
  Present: number;
  Absent: number;
  Late: number;
}

export interface ClassDistribution {
  className: string;
  students: number;
}

export interface FeeCollectionData {
  name: string;
  value: number;
  amount: string;
  color: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  category: 'Academic' | 'Sports' | 'Meeting' | 'Cultural' | 'Holiday';
  date: string;
  time: string;
  location: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  targetAudience: 'All' | 'Staff' | 'Parents' | 'Students';
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  author: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: string;
  avatar?: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'creation' | 'assignment' | 'payment' | 'system' | 'update';
}

export interface StaffRegistrationInput {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  sendEmailNotification: boolean;
  temporaryPassword?: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  actionKey: string;
}
