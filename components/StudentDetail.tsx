import React, { useMemo } from 'react';
import { Student, ScanResult, ErrorCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Button } from './Button';

interface StudentDetailProps {
  student: Student;
  scans: ScanResult[];
  onBack: () => void;
  onScanNew: () => void;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ student, scans, onBack, onScanNew }) => {
  
  const stats = useMemo(() => {
    const errorCounts: Record<string, number> = {};
    Object.values(ErrorCategory).forEach(cat => errorCounts[cat] = 0);

    scans.forEach(scan => {
      scan.errors.forEach(err => {
        const cat = err.category || ErrorCategory.Other;
        errorCounts[cat] = (errorCounts[cat] || 0) + 1;
      });
    });

    return Object.entries(errorCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [scans]);

  const COLORS = ['#4f46e5', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 flex items-center">
          <i className="fas fa-arrow-left mr-2"></i> Back
        </button>
        <div className="flex space-x-2">
           <Button onClick={onScanNew} icon={<i className="fas fa-camera"></i>}>
             New Scan
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-500">{scans.length} submissions tracked</p>
          </div>
        </div>

        {/* Charts */}
        {scans.length > 0 ? (
          <div className="h-64 w-full mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Common Error Types</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No data available. Scan a document to see insights.</p>
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Scans</h3>
        {scans.length === 0 ? (
          <p className="text-gray-500 italic">No scans recorded yet.</p>
        ) : (
          scans.slice().reverse().map(scan => (
            <div key={scan.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {new Date(scan.timestamp).toLocaleDateString()} • {new Date(scan.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {scan.errors.length} Issues Found
                </span>
              </div>
              <p className="text-gray-800 text-sm mb-3">{scan.summary}</p>
              
              {/* Errors Accordion/List */}
              <div className="mt-3 space-y-2 border-t pt-3">
                {scan.errors.map((err, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                     <i className="fas fa-exclamation-circle text-amber-500 mt-1 flex-shrink-0"></i>
                     <div>
                       <p className="font-medium text-gray-900">"{err.originalText}" <i className="fas fa-arrow-right text-gray-400 mx-1"></i> <span className="text-green-600">{err.correction}</span></p>
                       <p className="text-xs text-gray-500">{err.explanation}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
