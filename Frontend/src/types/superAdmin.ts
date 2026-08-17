export type PlanType = 'Basic' | 'Pro' | 'Enterprise';
export type ContractStatus = 'Active' | 'Expiring Soon' | 'Expired';
export type RoyaltyStatus = 'Paid' | 'Pending' | 'Overdue';
export type FranchiseStatus = 'Active' | 'Inactive';
export type RenewalStatus = 'Auto Renewal' | 'Pending Renewal' | 'Manual Renewal';

export interface Franchise {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  plan: PlanType;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword?: string;
  studentCount: number;
  teacherCount: number;
  contractStatus: ContractStatus;
  royaltyStatus: RoyaltyStatus;
  status: FranchiseStatus;
  joinedDate: string;
  contractStartDate: string;
  contractEndDate: string;
  monthlyRoyalty: number;
}

export interface FranchiseAdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  schoolId: string;
  schoolName: string;
  role: 'Franchise Admin';
  lastLogin: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
}

export interface RoyaltyRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  plan: PlanType;
  monthlyAmount: number;
  dueDay: number;
  dueDate: string;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  status: RoyaltyStatus;
  paidDate?: string;
  billingCycle: 'Monthly' | 'Quarterly' | 'Annually';
  invoiceNumber: string;
}

export interface RoyaltyConfig {
  id: string;
  plan: PlanType;
  monthlyRoyalty: number;
  billingCycle: 'Monthly' | 'Quarterly' | 'Annually';
  dueDay: number;
  gracePeriodDays: number;
  lateFeePercentage: number;
  status: 'Active' | 'Inactive';
}

export interface Contract {
  id: string;
  contractNumber: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  agreementTitle: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  monthlyRoyalty: number;
  plan: PlanType;
  renewalStatus: RenewalStatus;
  status: ContractStatus;
  daysRemaining: number;
  documentUrl?: string;
}

export interface SuperAdminNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  category: 'franchise' | 'royalty' | 'contract' | 'system';
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export interface SuperAdminSettings {
  platformName: string;
  platformEmail: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  themeMode: 'light' | 'dark' | 'system';
  textSize: 'normal' | 'large' | 'xlarge';
  reducedMotion: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  screenReaderFriendly: boolean;
  twoFactorEnabled: boolean;
}
