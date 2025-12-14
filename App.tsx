import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Student, ScanResult, DetectedError } from './types';
import { StudentList } from './components/StudentList';
import { Scanner } from './components/Scanner';
import { StudentDetail } from './components/StudentDetail';
import { AddStudent } from './components/AddStudent';
import { Button } from './components/Button';

const App: React.FC = () => {
  // --- State ---
  const [students, setStudents] = useState<Student[]>([]);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [view, setView] = useState<'dashboard' | 'student-detail' | 'scanner' | 'new-student'>('dashboard');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    const savedStudents = localStorage.getItem('gl_students');
    const savedScans = localStorage.getItem('gl_scans');
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedScans) setScans(JSON.parse(savedScans));
  }, []);

  useEffect(() => {
    localStorage.setItem('gl_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('gl_scans', JSON.stringify(scans));
  }, [scans]);

  // --- Actions ---
  const addStudent = (name: string, grade: string) => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name,
      gradeLevel: grade,
      createdAt: new Date().toISOString()
    };
    setStudents([...students, newStudent]);
    setView('dashboard');
  };

  const addStudentsBulk = (newStudentsData: { name: string; grade: string }[]) => {
    const newStudents: Student[] = newStudentsData.map(d => ({
      id: crypto.randomUUID(),
      name: d.name,
      gradeLevel: d.grade,
      createdAt: new Date().toISOString()
    }));
    setStudents([...students, ...newStudents]);
    setView('dashboard');
  };

  const handleScanComplete = (studentId: string, summary: string, errors: DetectedError[], image: string) => {
    const newScan: ScanResult = {
      id: crypto.randomUUID(),
      studentId,
      timestamp: new Date().toISOString(),
      summary,
      errors,
      // In a real app, upload image to storage and get URL. 
      // Here we might just drop it to save localStorage space, or store a thumbnail.
      // For functionality, we'll skip storing the base64 image permanently to avoid quota limits quickly.
      imageUrl: undefined 
    };
    setScans([...scans, newScan]);
    setActiveStudentId(studentId);
    setView('student-detail');
  };

  // --- Navigation Helpers ---
  const activeStudent = students.find(s => s.id === activeStudentId);
  const activeStudentScans = scans.filter(s => s.studentId === activeStudentId);

  // --- Render Views ---
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <StudentList 
            students={students} 
            onSelectStudent={(s) => { setActiveStudentId(s.id); setView('student-detail'); }}
            onAddStudent={() => setView('new-student')}
          />
        );
      
      case 'new-student':
        return (
          <AddStudent 
            onAddSingle={addStudent} 
            onAddBulk={addStudentsBulk}
            onCancel={() => setView('dashboard')} 
          />
        );

      case 'student-detail':
        if (!activeStudent) return <div>Student not found</div>;
        return (
          <StudentDetail 
            student={activeStudent}
            scans={activeStudentScans}
            onBack={() => setView('dashboard')}
            onScanNew={() => setView('scanner')}
          />
        );

      case 'scanner':
        return (
          <Scanner 
            students={students}
            preSelectedStudentId={activeStudentId || undefined}
            onScanComplete={handleScanComplete}
            onCancel={() => {
              if (activeStudentId) setView('student-detail');
              else setView('dashboard');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => { setActiveStudentId(null); setView('dashboard'); }}>
              <i className="fas fa-glasses text-white text-2xl mr-3"></i>
              <span className="text-white font-bold text-xl">GrammarLens</span>
            </div>
            {view === 'dashboard' && students.length > 0 && (
               <button 
                 onClick={() => { setActiveStudentId(null); setView('scanner'); }}
                 className="text-indigo-100 hover:text-white"
               >
                 <i className="fas fa-camera text-xl"></i>
               </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;