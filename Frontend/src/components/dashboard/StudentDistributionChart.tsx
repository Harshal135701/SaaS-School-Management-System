import React from 'react';
import { Card } from '../ui/Card';
import { mockClassDistribution } from '../../data/mockData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Layers } from 'lucide-react';

export const StudentDistributionChart: React.FC = () => {
  return (
    <Card hoverLift padding="md" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Students by Class</h3>
          <p className="text-xs text-slate-500">Classroom strength distribution across Grades 1–12</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockClassDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="className" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(val: any) => [`${val} Students`, 'Strength']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                fontSize: '12px',
                fontWeight: '600'
              }}
            />
            <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
