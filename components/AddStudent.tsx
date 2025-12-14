import React, { useState } from 'react';
import { Button } from './Button';

interface AddStudentProps {
  onAddSingle: (name: string, grade: string) => void;
  onAddBulk: (students: { name: string; grade: string }[]) => void;
  onCancel: () => void;
}

export const AddStudent: React.FC<AddStudentProps> = ({ onAddSingle, onAddBulk, onCancel }) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [bulkText, setBulkText] = useState('');

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText.split('\n');
    const students = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Check for comma separation
        const parts = line.split(',');
        if (parts.length > 1) {
          // Assume Format: Name, Grade
          return {
            name: parts[0].trim(),
            grade: parts.slice(1).join(',').trim()
          };
        }
        // Assume Format: Name (no grade)
        return { name: line, grade: '' };
      });
    
    if (students.length > 0) {
      onAddBulk(students);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Add Students</h2>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          className={`pb-3 px-4 text-sm font-medium transition-colors ${mode === 'single' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setMode('single')}
        >
          Single Entry
        </button>
        <button
          type="button"
          className={`pb-3 px-4 text-sm font-medium transition-colors ${mode === 'bulk' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setMode('bulk')}
        >
          Bulk Import
        </button>
      </div>

      {mode === 'single' ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onAddSingle(formData.get('name') as string, formData.get('grade') as string);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Name</label>
            <input required name="name" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="e.g. Alex Johnson" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade / Class (Optional)</label>
            <input name="grade" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="e.g. 5th Grade" />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Add Student</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 mb-4">
             <h4 className="text-sm font-bold text-indigo-800 mb-1"><i className="fas fa-info-circle mr-1"></i> How to format</h4>
             <p className="text-xs text-indigo-700">
               Enter one student per line. Optionally add a comma to specify the grade level.
               <br/>
               <span className="font-mono mt-1 block bg-white/50 p-1 rounded">
                 Student Name<br/>
                 Student Name, Grade Level
               </span>
             </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste Student List</label>
            <textarea 
              required
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono" 
              placeholder={"John Smith\nJane Doe, 4th Grade\nRobert Brown, 5B"} 
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Import Students</Button>
          </div>
        </form>
      )}
    </div>
  );
};