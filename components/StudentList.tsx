import React from 'react';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddStudent: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent, onAddStudent }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Students</h2>
        <button 
          onClick={onAddStudent}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <i className="fas fa-plus mr-2"></i> New Student
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <i className="fas fa-user-graduate text-4xl text-gray-400 mb-4"></i>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a student to your class.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <div 
              key={student.id} 
              onClick={() => onSelectStudent(student)}
              className="relative rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-indigo-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-500 truncate">{student.gradeLevel || 'No Grade Level'}</p>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
