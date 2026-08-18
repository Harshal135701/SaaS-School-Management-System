import type {
  Franchise,
  FranchiseAdminUser,
  RoyaltyRecord,
  RoyaltyConfig,
  Contract,
  SuperAdminNotification,
  SuperAdminSettings
} from '../types/superAdmin';

export const superAdminProfile = {
  id: 'usr_super_admin_01',
  name: 'Krishna Patil',
  email: 'krishna.admin@edusphere.edu',
  role: 'Super Admin' as const,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  phone: '+91 98765 43210',
  title: 'Chief SaaS Platform Administrator'
};

export const mockFranchises: Franchise[] = [
  {
    id: 'fr-001',
    code: 'FR-001',
    name: 'ABC International School',
    email: 'contact@abcinternational.edu',
    phone: '+91 98230 11223',
    address: 'Kalyani Nagar, East Wing',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    plan: 'Enterprise',
    adminName: 'Rahul Sharma',
    adminEmail: 'rahul.admin@abcinternational.edu',
    adminPhone: '+91 98230 11224',
    adminPassword: 'Password123!',
    studentCount: 1420,
    teacherCount: 95,
    contractStatus: 'Active',
    royaltyStatus: 'Paid',
    status: 'Active',
    joinedDate: '2025-08-01',
    contractStartDate: '2025-08-01',
    contractEndDate: '2027-07-31',
    monthlyRoyalty: 65000
  },
  {
    id: 'fr-002',
    code: 'FR-002',
    name: 'XYZ Public School',
    email: 'info@xyzpublic.edu',
    phone: '+91 98190 44556',
    address: 'Bandra West, Link Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    plan: 'Pro',
    adminName: 'Amit Patil',
    adminEmail: 'amit.patil@xyzpublic.edu',
    adminPhone: '+91 98190 44557',
    adminPassword: 'Password123!',
    studentCount: 980,
    teacherCount: 64,
    contractStatus: 'Active',
    royaltyStatus: 'Pending',
    status: 'Active',
    joinedDate: '2025-09-15',
    contractStartDate: '2025-09-15',
    contractEndDate: '2027-09-14',
    monthlyRoyalty: 42000
  },
  {
    id: 'fr-003',
    code: 'FR-003',
    name: 'St. Xavier Global Academy',
    email: 'admin@stxavierglobal.org',
    phone: '+91 98221 88990',
    address: 'Civil Lines',
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    plan: 'Enterprise',
    adminName: 'Fr. Thomas D\'Souza',
    adminEmail: 'thomas.admin@stxavierglobal.org',
    adminPhone: '+91 98221 88991',
    adminPassword: 'Password123!',
    studentCount: 1850,
    teacherCount: 120,
    contractStatus: 'Expiring Soon',
    royaltyStatus: 'Overdue',
    status: 'Active',
    joinedDate: '2024-09-01',
    contractStartDate: '2024-09-01',
    contractEndDate: '2026-09-30',
    monthlyRoyalty: 75000
  },
  {
    id: 'fr-004',
    code: 'FR-004',
    name: 'Greenwood High School',
    email: 'help@greenwoodhigh.ac.in',
    phone: '+91 98450 77112',
    address: 'Whitefield Main Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    plan: 'Pro',
    adminName: 'Sujata Nair',
    adminEmail: 'sujata.nair@greenwoodhigh.ac.in',
    adminPhone: '+91 98450 77113',
    adminPassword: 'Password123!',
    studentCount: 1100,
    teacherCount: 78,
    contractStatus: 'Active',
    royaltyStatus: 'Paid',
    status: 'Active',
    joinedDate: '2025-11-10',
    contractStartDate: '2025-11-10',
    contractEndDate: '2027-11-09',
    monthlyRoyalty: 45000
  },
  {
    id: 'fr-005',
    code: 'FR-005',
    name: 'Delhi Heritage School',
    email: 'contact@delhiheritage.edu',
    phone: '+91 98110 33221',
    address: 'Vasant Kunj Sector C',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    plan: 'Basic',
    adminName: 'Vikas Roy',
    adminEmail: 'vikas.roy@delhiheritage.edu',
    adminPhone: '+91 98110 33222',
    adminPassword: 'Password123!',
    studentCount: 650,
    teacherCount: 42,
    contractStatus: 'Active',
    royaltyStatus: 'Paid',
    status: 'Active',
    joinedDate: '2026-01-10',
    contractStartDate: '2026-01-10',
    contractEndDate: '2027-01-09',
    monthlyRoyalty: 25000
  },
  {
    id: 'fr-006',
    code: 'FR-006',
    name: 'Sunbeam World School',
    email: 'support@sunbeamworld.com',
    phone: '+91 98390 66442',
    address: 'Sigra Main Road',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    plan: 'Pro',
    adminName: 'Rajesh Mishra',
    adminEmail: 'rajesh.mishra@sunbeamworld.com',
    adminPhone: '+91 98390 66443',
    adminPassword: 'Password123!',
    studentCount: 890,
    teacherCount: 58,
    contractStatus: 'Expiring Soon',
    royaltyStatus: 'Pending',
    status: 'Active',
    joinedDate: '2024-10-01',
    contractStartDate: '2024-10-01',
    contractEndDate: '2026-09-15',
    monthlyRoyalty: 42000
  },
  {
    id: 'fr-007',
    code: 'FR-007',
    name: 'Orchid STEM Academy',
    email: 'office@orchidstem.edu',
    phone: '+91 98400 99881',
    address: 'Adyar Phase II',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    plan: 'Enterprise',
    adminName: 'Karthik Subramanian',
    adminEmail: 'karthik@orchidstem.edu',
    adminPhone: '+91 98400 99882',
    adminPassword: 'Password123!',
    studentCount: 1620,
    teacherCount: 110,
    contractStatus: 'Active',
    royaltyStatus: 'Paid',
    status: 'Active',
    joinedDate: '2025-06-01',
    contractStartDate: '2025-06-01',
    contractEndDate: '2027-05-31',
    monthlyRoyalty: 70000
  },
  {
    id: 'fr-008',
    code: 'FR-008',
    name: 'Silver Oak Convent School',
    email: 'admin@silveroakconvent.in',
    phone: '+91 98720 55114',
    address: 'Model Town Sector 4',
    city: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    plan: 'Basic',
    adminName: 'Gurpreet Singh',
    adminEmail: 'gurpreet@silveroakconvent.in',
    adminPhone: '+91 98720 55115',
    adminPassword: 'Password123!',
    studentCount: 450,
    teacherCount: 30,
    contractStatus: 'Expired',
    royaltyStatus: 'Overdue',
    status: 'Inactive',
    joinedDate: '2024-05-01',
    contractStartDate: '2024-05-01',
    contractEndDate: '2026-05-01',
    monthlyRoyalty: 25000
  }
];

export const mockFranchiseAdmins: FranchiseAdminUser[] = mockFranchises.map(f => ({
  id: `admin_${f.id}`,
  name: f.adminName,
  email: f.adminEmail,
  phone: f.adminPhone,
  schoolId: f.id,
  schoolName: f.name,
  role: 'Franchise Admin',
  lastLogin: '2026-08-16 10:45 AM',
  status: f.status
}));

export const mockRoyaltyRecords: RoyaltyRecord[] = [
  {
    id: 'roy-101',
    schoolId: 'fr-001',
    schoolName: 'ABC International School',
    schoolCode: 'FR-001',
    plan: 'Enterprise',
    monthlyAmount: 65000,
    dueDay: 5,
    dueDate: '2026-08-05',
    paidAmount: 65000,
    pendingAmount: 0,
    overdueAmount: 0,
    status: 'Paid',
    paidDate: '2026-08-03',
    billingCycle: 'Monthly',
    invoiceNumber: 'INV-2026-08-001'
  },
  {
    id: 'roy-102',
    schoolId: 'fr-002',
    schoolName: 'XYZ Public School',
    schoolCode: 'FR-002',
    plan: 'Pro',
    monthlyAmount: 42000,
    dueDay: 10,
    dueDate: '2026-08-10',
    paidAmount: 0,
    pendingAmount: 42000,
    overdueAmount: 0,
    status: 'Pending',
    billingCycle: 'Monthly',
    invoiceNumber: 'INV-2026-08-002'
  },
  {
    id: 'roy-103',
    schoolId: 'fr-003',
    schoolName: 'St. Xavier Global Academy',
    schoolCode: 'FR-003',
    plan: 'Enterprise',
    monthlyAmount: 75000,
    dueDay: 1,
    dueDate: '2026-08-01',
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 75000,
    status: 'Overdue',
    billingCycle: 'Monthly',
    invoiceNumber: 'INV-2026-08-003'
  },
  {
    id: 'roy-104',
    schoolId: 'fr-004',
    schoolName: 'Greenwood High School',
    schoolCode: 'FR-004',
    plan: 'Pro',
    monthlyAmount: 45000,
    dueDay: 5,
    dueDate: '2026-08-05',
    paidAmount: 45000,
    pendingAmount: 0,
    overdueAmount: 0,
    status: 'Paid',
    paidDate: '2026-08-04',
    billingCycle: 'Monthly',
    invoiceNumber: 'INV-2026-08-004'
  },
  {
    id: 'roy-105',
    schoolId: 'fr-005',
    schoolName: 'Delhi Heritage School',
    schoolCode: 'FR-005',
    plan: 'Basic',
    monthlyAmount: 25000,
    dueDay: 5,
    dueDate: '2026-08-05',
    paidAmount: 25000,
    pendingAmount: 0,
    overdueAmount: 0,
    status: 'Paid',
    paidDate: '2026-08-02',
    billingCycle: 'Monthly',
    invoiceNumber: 'INV-2026-08-005'
  },
  {
    id: 'roy-106',
    schoolId: 'fr-006',
    schoolName: 'Sunbeam World School',
    schoolCode: 'FR-006',
    plan: 'Pro',
    monthlyAmount: 42000,
    dueDay: 12,
    dueDate: '2026-08-12',
    paidAmount: 0,
    pendingAmount: 42000,
    overdueAmount: 0,
    status: 'Pending',
    billingCycle: 'Monthly',
    invoiceNumber: 'INV-2026-08-006'
  },
  {
    id: 'roy-107',
    schoolId: 'fr-007',
    schoolName: 'Orchid STEM Academy',
    schoolCode: 'FR-007',
    plan: 'Enterprise',
    monthlyAmount: 70000,
    dueDay: 5,
    dueDate: '2026-08-05',
    paidAmount: 70000,
    pendingAmount: 0,
    overdueAmount: 0,
    status: 'Paid',
    paidDate: '2026-08-05',
    billingCycle: 'Monthly',
    invoiceNumber: 'INV-2026-08-007'
  }
];

export const mockRoyaltyConfigs: RoyaltyConfig[] = [
  {
    id: 'cfg-01',
    plan: 'Basic',
    monthlyRoyalty: 25000,
    billingCycle: 'Monthly',
    dueDay: 5,
    gracePeriodDays: 5,
    lateFeePercentage: 2.5,
    status: 'Active'
  },
  {
    id: 'cfg-02',
    plan: 'Pro',
    monthlyRoyalty: 45000,
    billingCycle: 'Monthly',
    dueDay: 5,
    gracePeriodDays: 5,
    lateFeePercentage: 2.0,
    status: 'Active'
  },
  {
    id: 'cfg-03',
    plan: 'Enterprise',
    monthlyRoyalty: 75000,
    billingCycle: 'Monthly',
    dueDay: 5,
    gracePeriodDays: 7,
    lateFeePercentage: 1.5,
    status: 'Active'
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'cnt-001',
    contractNumber: 'CNT-2025-001',
    schoolId: 'fr-001',
    schoolName: 'ABC International School',
    schoolCode: 'FR-001',
    agreementTitle: 'Master SaaS Franchise Agreement v2.4',
    startDate: '2025-08-01',
    endDate: '2027-07-31',
    durationMonths: 24,
    monthlyRoyalty: 65000,
    plan: 'Enterprise',
    renewalStatus: 'Auto Renewal',
    status: 'Active',
    daysRemaining: 348
  },
  {
    id: 'cnt-002',
    contractNumber: 'CNT-2025-002',
    schoolId: 'fr-002',
    schoolName: 'XYZ Public School',
    schoolCode: 'FR-002',
    agreementTitle: 'Pro Plan Service Level Agreement',
    startDate: '2025-09-15',
    endDate: '2027-09-14',
    durationMonths: 24,
    monthlyRoyalty: 42000,
    plan: 'Pro',
    renewalStatus: 'Pending Renewal',
    status: 'Active',
    daysRemaining: 393
  },
  {
    id: 'cnt-003',
    contractNumber: 'CNT-2024-003',
    schoolId: 'fr-003',
    schoolName: 'St. Xavier Global Academy',
    schoolCode: 'FR-003',
    agreementTitle: 'Enterprise SaaS Operating Contract',
    startDate: '2024-09-01',
    endDate: '2026-09-30',
    durationMonths: 24,
    monthlyRoyalty: 75000,
    plan: 'Enterprise',
    renewalStatus: 'Pending Renewal',
    status: 'Expiring Soon',
    daysRemaining: 44
  },
  {
    id: 'cnt-004',
    contractNumber: 'CNT-2025-004',
    schoolId: 'fr-004',
    schoolName: 'Greenwood High School',
    schoolCode: 'FR-004',
    agreementTitle: 'Standard Pro Franchise Contract',
    startDate: '2025-11-10',
    endDate: '2027-11-09',
    durationMonths: 24,
    monthlyRoyalty: 45000,
    plan: 'Pro',
    renewalStatus: 'Auto Renewal',
    status: 'Active',
    daysRemaining: 449
  },
  {
    id: 'cnt-005',
    contractNumber: 'CNT-2026-005',
    schoolId: 'fr-005',
    schoolName: 'Delhi Heritage School',
    schoolCode: 'FR-005',
    agreementTitle: 'Basic Tier SaaS Provision Contract',
    startDate: '2026-01-10',
    endDate: '2027-01-09',
    durationMonths: 12,
    monthlyRoyalty: 25000,
    plan: 'Basic',
    renewalStatus: 'Manual Renewal',
    status: 'Active',
    daysRemaining: 145
  },
  {
    id: 'cnt-006',
    contractNumber: 'CNT-2024-006',
    schoolId: 'fr-006',
    schoolName: 'Sunbeam World School',
    schoolCode: 'FR-006',
    agreementTitle: 'Pro Plan Multi-Campus License',
    startDate: '2024-10-01',
    endDate: '2026-09-15',
    durationMonths: 24,
    monthlyRoyalty: 42000,
    plan: 'Pro',
    renewalStatus: 'Pending Renewal',
    status: 'Expiring Soon',
    daysRemaining: 29
  },
  {
    id: 'cnt-007',
    contractNumber: 'CNT-2024-008',
    schoolId: 'fr-008',
    schoolName: 'Silver Oak Convent School',
    schoolCode: 'FR-008',
    agreementTitle: 'Basic Tier Operating License',
    startDate: '2024-05-01',
    endDate: '2026-05-01',
    durationMonths: 24,
    monthlyRoyalty: 25000,
    plan: 'Basic',
    renewalStatus: 'Pending Renewal',
    status: 'Expired',
    daysRemaining: -108
  }
];

export const mockSuperAdminNotifications: SuperAdminNotification[] = [
  {
    id: 'notif-1',
    title: 'New Franchise Registered',
    description: 'Delhi Heritage School (FR-005) completed onboarding under Basic Plan.',
    timestamp: '25 mins ago',
    read: false,
    category: 'franchise',
    severity: 'success'
  },
  {
    id: 'notif-2',
    title: 'Royalty Payment Overdue',
    description: 'St. Xavier Global Academy (FR-003) monthly payment of ₹75,000 is 16 days overdue.',
    timestamp: '2 hours ago',
    read: false,
    category: 'royalty',
    severity: 'danger'
  },
  {
    id: 'notif-3',
    title: 'Contract Expiring Soon',
    description: 'Sunbeam World School (FR-006) contract ends in 29 days.',
    timestamp: '5 hours ago',
    read: false,
    category: 'contract',
    severity: 'warning'
  },
  {
    id: 'notif-4',
    title: 'Royalty Received',
    description: 'ABC International School paid ₹65,000 for August 2026.',
    timestamp: '1 day ago',
    read: true,
    category: 'royalty',
    severity: 'info'
  }
];

export const mockSuperAdminSettings: SuperAdminSettings = {
  platformName: 'EduSphere SaaS Platform',
  platformEmail: 'admin@edusphere.edu',
  supportEmail: 'support@edusphere.edu',
  currency: 'INR (₹)',
  timezone: 'Asia/Kolkata (GMT+05:30)',
  dateFormat: 'DD/MM/YYYY',
  themeMode: 'light',
  textSize: 'normal',
  reducedMotion: false,
  highContrast: false,
  keyboardNavigation: true,
  screenReaderFriendly: true,
  twoFactorEnabled: true
};

// Analytics Data for Recharts
export const mockRevenueTrends = {
  '6 Months': [
    { month: 'Mar', revenue: 610000, collected: 590000, pending: 20000 },
    { month: 'Apr', revenue: 680000, collected: 650000, pending: 30000 },
    { month: 'May', revenue: 740000, collected: 710000, pending: 30000 },
    { month: 'Jun', revenue: 810000, collected: 780000, pending: 30000 },
    { month: 'Jul', revenue: 830000, collected: 800000, pending: 30000 },
    { month: 'Aug', revenue: 845000, collected: 720000, pending: 125000 }
  ],
  '12 Months': [
    { month: 'Sep', revenue: 510000, collected: 500000, pending: 10000 },
    { month: 'Oct', revenue: 530000, collected: 520000, pending: 10000 },
    { month: 'Nov', revenue: 550000, collected: 540000, pending: 10000 },
    { month: 'Dec', revenue: 580000, collected: 570000, pending: 10000 },
    { month: 'Jan', revenue: 590000, collected: 580000, pending: 10000 },
    { month: 'Feb', revenue: 600000, collected: 590000, pending: 10000 },
    { month: 'Mar', revenue: 610000, collected: 590000, pending: 20000 },
    { month: 'Apr', revenue: 680000, collected: 650000, pending: 30000 },
    { month: 'May', revenue: 740000, collected: 710000, pending: 30000 },
    { month: 'Jun', revenue: 810000, collected: 780000, pending: 30000 },
    { month: 'Jul', revenue: 830000, collected: 800000, pending: 30000 },
    { month: 'Aug', revenue: 845000, collected: 720000, pending: 125000 }
  ],
  'This Year': [
    { month: 'Jan', revenue: 590000, collected: 580000, pending: 10000 },
    { month: 'Feb', revenue: 600000, collected: 590000, pending: 10000 },
    { month: 'Mar', revenue: 610000, collected: 590000, pending: 20000 },
    { month: 'Apr', revenue: 680000, collected: 650000, pending: 30000 },
    { month: 'May', revenue: 740000, collected: 710000, pending: 30000 },
    { month: 'Jun', revenue: 810000, collected: 780000, pending: 30000 },
    { month: 'Jul', revenue: 830000, collected: 800000, pending: 30000 },
    { month: 'Aug', revenue: 845000, collected: 720000, pending: 125000 }
  ]
};

export const mockRoyaltyPaymentStatusData = [
  { name: 'Paid', value: 72, amount: '₹6,55,000', color: '#10b981' },
  { name: 'Pending', value: 18, amount: '₹1,25,000', color: '#f59e0b' },
  { name: 'Overdue', value: 10, amount: '₹65,000', color: '#f43f5e' }
];

export const mockFranchiseStatusData = [
  { name: 'Active', value: 21, color: '#2563eb' },
  { name: 'Inactive', value: 3, color: '#94a3b8' }
];

export const mockFranchiseGrowthData = [
  { month: 'Mar', count: 18 },
  { month: 'Apr', count: 19 },
  { month: 'May', count: 20 },
  { month: 'Jun', count: 22 },
  { month: 'Jul', count: 23 },
  { month: 'Aug', count: 24 }
];

export const mockPlanDistributionData = [
  { name: 'Basic', value: 8, percentage: '33.3%', color: '#6366f1' },
  { name: 'Pro', value: 10, percentage: '41.7%', color: '#2563eb' },
  { name: 'Enterprise', value: 6, percentage: '25.0%', color: '#0d9488' }
];

export const mockContractOverviewData = [
  { category: 'Active', count: 21, color: '#10b981' },
  { category: 'Expiring Soon', count: 3, color: '#f59e0b' },
  { category: 'Expired', count: 1, color: '#f43f5e' }
];
