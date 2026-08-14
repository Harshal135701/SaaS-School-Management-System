import type { 
  StatItem, 
  AttendanceRecord, 
  ClassDistribution, 
  FeeCollectionData, 
  SchoolEvent, 
  NoticeItem, 
  ActivityLog,
  User
} from '../types';

export const currentUser: User = {
  id: 'usr_admin_01',
  name: 'Krishna Patil',
  email: 'krishna.admin@edusphere.edu',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  department: 'Administration',
  phone: '+91 98765 43210'
};

export const mockStatCards: StatItem[] = [
  {
    id: 'stat_students',
    title: 'TOTAL STUDENTS',
    value: '1,248',
    change: '+8.2%',
    isPositive: true,
    subtext: 'from last month',
    iconName: 'GraduationCap',
    color: 'blue'
  },
  {
    id: 'stat_teachers',
    title: 'TOTAL TEACHERS',
    value: '84',
    change: '+2.5%',
    isPositive: true,
    subtext: 'from last month',
    iconName: 'Users',
    color: 'purple'
  },
  {
    id: 'stat_staff',
    title: 'TOTAL STAFF',
    value: '36',
    change: '+1.1%',
    isPositive: true,
    subtext: 'from last month',
    iconName: 'UserCheck',
    color: 'emerald'
  },
  {
    id: 'stat_parents',
    title: 'TOTAL PARENTS',
    value: '960',
    change: '+5.4%',
    isPositive: true,
    subtext: 'from last month',
    iconName: 'HeartHandshake',
    color: 'indigo'
  },
  {
    id: 'stat_classes',
    title: 'TOTAL CLASSES',
    value: '24',
    change: '0.0%',
    isPositive: true,
    neutral: true,
    subtext: 'active sections',
    iconName: 'Building2',
    color: 'amber'
  },
  {
    id: 'stat_pending',
    title: 'PENDING ADMISSIONS',
    value: '18',
    change: '-3.2%',
    isPositive: false,
    subtext: 'needs verification',
    iconName: 'UserPlus',
    color: 'rose'
  }
];

export const mockAttendanceData: Record<'Today' | 'This Week' | 'This Month', AttendanceRecord[]> = {
  'Today': [
    { name: 'Grade 1-3', Present: 280, Absent: 12, Late: 5 },
    { name: 'Grade 4-6', Present: 310, Absent: 8, Late: 4 },
    { name: 'Grade 7-9', Present: 305, Absent: 15, Late: 6 },
    { name: 'Grade 10-12', Present: 285, Absent: 13, Late: 5 }
  ],
  'This Week': [
    { name: 'Mon', Present: 1195, Absent: 35, Late: 18 },
    { name: 'Tue', Present: 1205, Absent: 28, Late: 15 },
    { name: 'Wed', Present: 1180, Absent: 48, Late: 20 },
    { name: 'Thu', Present: 1210, Absent: 25, Late: 13 },
    { name: 'Fri', Present: 1190, Absent: 40, Late: 18 }
  ],
  'This Month': [
    { name: 'Week 1', Present: 5950, Absent: 180, Late: 90 },
    { name: 'Week 2', Present: 6010, Absent: 140, Late: 75 },
    { name: 'Week 3', Present: 5920, Absent: 210, Late: 110 },
    { name: 'Week 4', Present: 6050, Absent: 120, Late: 65 }
  ]
};

export const mockFeeCollection: FeeCollectionData[] = [
  { name: 'Collected', value: 18.4, amount: '₹18.4L (76%)', color: '#2563eb' },
  { name: 'Pending', value: 3.2, amount: '₹3.2L (13%)', color: '#f59e0b' },
  { name: 'Overdue', value: 1.1, amount: '₹1.1L (11%)', color: '#ef4444' }
];

export const mockClassDistribution: ClassDistribution[] = [
  { className: 'Class 1', students: 92 },
  { className: 'Class 2', students: 88 },
  { className: 'Class 3', students: 95 },
  { className: 'Class 4', students: 102 },
  { className: 'Class 5', students: 110 },
  { className: 'Class 6', students: 108 },
  { className: 'Class 7', students: 115 },
  { className: 'Class 8', students: 112 },
  { className: 'Class 9', students: 120 },
  { className: 'Class 10', students: 118 },
  { className: 'Class 11', students: 94 },
  { className: 'Class 12', students: 94 }
];

export const mockEvents: SchoolEvent[] = [
  {
    id: 'evt_1',
    title: 'Parent-Teacher Meeting (PTM)',
    category: 'Meeting',
    date: 'Aug 18, 2026',
    time: '09:00 AM - 01:00 PM',
    location: 'Main Auditorium & Classrooms'
  },
  {
    id: 'evt_2',
    title: 'Mid-Term Examination Commencement',
    category: 'Academic',
    date: 'Aug 24, 2026',
    time: '08:30 AM - 12:30 PM',
    location: 'All Examination Halls'
  },
  {
    id: 'evt_3',
    title: 'Annual Sports Day Qualification Round',
    category: 'Sports',
    date: 'Sep 02, 2026',
    time: '07:30 AM - 03:00 PM',
    location: 'School Sports Complex'
  },
  {
    id: 'evt_4',
    title: 'Inter-School Science & Tech Exhibition',
    category: 'Cultural',
    date: 'Sep 12, 2026',
    time: '10:00 AM - 04:00 PM',
    location: 'Science Pavilion'
  }
];

export const mockNotices: NoticeItem[] = [
  {
    id: 'ntc_1',
    title: 'Annual Sports Day Registration Open',
    targetAudience: 'All',
    date: 'Aug 12, 2026',
    priority: 'High',
    author: 'Sports Committee'
  },
  {
    id: 'ntc_2',
    title: 'Mid-Term Examination Schedule & Guidelines',
    targetAudience: 'Students',
    date: 'Aug 10, 2026',
    priority: 'High',
    author: 'Academic Cell'
  },
  {
    id: 'ntc_3',
    title: 'Faculty Workshop on Digital Pedagogy',
    targetAudience: 'Staff',
    date: 'Aug 08, 2026',
    priority: 'Medium',
    author: 'Principal Office'
  },
  {
    id: 'ntc_4',
    title: 'Fee Payment Installment Reminder for Quarter 2',
    targetAudience: 'Parents',
    date: 'Aug 05, 2026',
    priority: 'Medium',
    author: 'Finance Office'
  }
];

export const mockActivities: ActivityLog[] = [
  {
    id: 'act_1',
    user: 'Krishna Patil',
    role: 'Super Admin',
    action: 'registered a new staff member',
    target: 'Dr. Ramesh Sharma (Physics HOD)',
    timestamp: '10 mins ago',
    type: 'creation'
  },
  {
    id: 'act_2',
    user: 'John Smith',
    role: 'Teacher',
    action: 'assigned as class teacher to',
    target: 'Class 10-A',
    timestamp: '25 mins ago',
    type: 'assignment'
  },
  {
    id: 'act_3',
    user: 'Finance Portal',
    role: 'Automated System',
    action: 'recorded online fee payment of ₹45,000 for',
    target: 'Ananya Kumar (Grade 10-B)',
    timestamp: '1 hour ago',
    type: 'payment'
  },
  {
    id: 'act_4',
    user: 'Meera Deshmukh',
    role: 'Parent',
    action: 'submitted registration for child',
    target: 'Rohan Deshmukh (Grade 5-C)',
    timestamp: '2 hours ago',
    type: 'creation'
  },
  {
    id: 'act_5',
    user: 'Academic Office',
    role: 'Data Entry',
    action: 'updated Mathematics Q1 marks for',
    target: 'Class 9 Section B',
    timestamp: '3 hours ago',
    type: 'update'
  }
];

export const mockInitialStaffList: User[] = [
  {
    id: 'stf_1',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@edusphere.edu',
    role: 'HOD',
    department: 'Physics & Science',
    phone: '+91 98111 22334',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'stf_2',
    name: 'Sunita Rao',
    email: 'sunita.rao@edusphere.edu',
    role: 'Teacher',
    department: 'Mathematics',
    phone: '+91 98222 33445',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'stf_3',
    name: 'Vikram Sengupta',
    email: 'vikram.s@edusphere.edu',
    role: 'Accountant',
    department: 'Finance & Accounts',
    phone: '+91 98333 44556',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'stf_4',
    name: 'Priya Joshi',
    email: 'priya.j@edusphere.edu',
    role: 'Principal',
    department: 'Executive Administration',
    phone: '+91 98444 55667',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  }
];
