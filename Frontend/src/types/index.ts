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
  panNumber?: string;
  aadhaarNumber?: string;
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

export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'OTHER';

export type InstallmentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface FeeCategory {
  id: string;
  franchiseId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentFee {
  id: string;
  franchiseId: string;
  studentId: string;
  feeCategoryId: string;
  originalAmount: number | string;
  discountPercent: number | string;
  finalAmount: number | string;
  remarks?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    admissionNumber?: string | null;
    rollNumber?: string | null;
    classId?: string | null;
    sectionId?: string | null;
  };
  category?: FeeCategory;
  installments?: Installment[];
}

export interface Installment {
  id: string;
  franchiseId: string;
  studentFeeId: string;
  installmentNumber: number;
  amount: number | string;
  dueDate: string;
  status: InstallmentStatus;
  createdAt?: string;
  updatedAt?: string;
  studentFee?: StudentFee;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  franchiseId: string;
  studentId: string;
  installmentId: string;
  amount: number | string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  receiptNumber: string;
  receivedBy: string;
  remarks?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: {
    id: string;
    name: string;
    email?: string | null;
  };
  installment?: Installment;
}

export interface FeeSummary {
  totalFee: number;
  discount: number;
  payable: number;
  paid: number;
  pending: number;
}
