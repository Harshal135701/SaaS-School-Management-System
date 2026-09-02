import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock, LogIn, LogOut, AlertCircle } from 'lucide-react';

export interface StaffAttendanceData {
  status: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT';
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number; // Total hours worked today (decimal)
}

interface StaffAttendanceCardProps {
  data?: StaffAttendanceData | null;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  isApiAvailable?: boolean;
}

export const StaffAttendanceCard: React.FC<StaffAttendanceCardProps> = ({
  data,
  onCheckIn,
  onCheckOut,
  isApiAvailable = false
}) => {
  // STATE 5: Attendance API unavailable
  if (!isApiAvailable) {
    return (
      <Card className="p-6 h-full flex flex-col justify-center items-center text-center space-y-3 bg-slate-50 border-dashed">
        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-2">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">My Staff Attendance</h3>
        <p className="text-xs text-slate-500 max-w-[250px]">
          Staff attendance and check-in functionality is not available yet.
        </p>
      </Card>
    );
  }

  // Fallback if API is claimed available but no data is provided
  if (!data) return null;

  const { status, checkInTime, checkOutTime, workingHours = 0 } = data;
  const hasCompleted7Hours = workingHours >= 7;

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">My Attendance</h3>
          <p className="text-xs text-slate-500 mt-1">Today's working status</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-700' :
          status === 'CHECKED_OUT' ? 'bg-slate-100 text-slate-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {status.replace('_', ' ')}
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {/* STATE 1: Not checked in */}
        {status === 'NOT_CHECKED_IN' && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-4">
            <p className="text-sm font-medium text-slate-600">You haven't checked in today.</p>
            <Button onClick={onCheckIn} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <LogIn className="w-4 h-4" /> Check In Now
            </Button>
          </div>
        )}

        {/* STATE 2 & 3: Checked In */}
        {status === 'CHECKED_IN' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Check-In Time</p>
                <p className="text-lg font-black text-slate-900">{checkInTime}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Working Hours</p>
                <p className="text-lg font-black text-blue-700">
                  {Math.floor(workingHours)}h {Math.round((workingHours % 1) * 60)}m
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button 
                onClick={onCheckOut} 
                disabled={!hasCompleted7Hours}
                variant={hasCompleted7Hours ? 'primary' : 'outline'}
                className={`w-full gap-2 ${!hasCompleted7Hours ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-70' : 'bg-rose-600 hover:bg-rose-700 text-white border-transparent'}`}
              >
                <LogOut className="w-4 h-4" /> Check Out
              </Button>
              <div className="mt-3 flex items-start gap-2">
                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${hasCompleted7Hours ? 'text-emerald-500' : 'text-amber-500'}`} />
                <p className={`text-xs ${hasCompleted7Hours ? 'text-emerald-600 font-medium' : 'text-amber-600'}`}>
                  {hasCompleted7Hours 
                    ? "Minimum working hours completed. You can check out." 
                    : "Check-out will be available after completing 7 working hours."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATE 4: Checked Out */}
        {status === 'CHECKED_OUT' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-In</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{checkInTime}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-Out</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{checkOutTime}</p>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Working Hours</p>
              <p className="text-xl font-black text-emerald-700">
                {Math.floor(workingHours)}h {Math.round((workingHours % 1) * 60)}m
              </p>
            </div>
            <Button disabled className="w-full bg-slate-100 text-slate-400 border-none cursor-not-allowed">
              Already Checked Out
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};