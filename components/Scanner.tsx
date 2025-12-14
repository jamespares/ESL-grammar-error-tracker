import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from './Button';
import { analyzeStudentWork } from '../services/geminiService';
import { DetectedError, Student } from '../types';

interface ScannerProps {
  students: Student[];
  preSelectedStudentId?: string;
  onScanComplete: (studentId: string, summary: string, errors: DetectedError[], image: string) => void;
  onCancel: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ students, preSelectedStudentId, onScanComplete, onCancel }) => {
  const [step, setStep] = useState<'select-student' | 'capture' | 'preview' | 'analyzing'>('select-student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preSelectedStudentId || '');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);

  // Skip selection if student is pre-selected
  React.useEffect(() => {
    if (preSelectedStudentId) {
      setStep('capture');
    }
  }, [preSelectedStudentId]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImageSrc(imageSrc);
      setStep('preview');
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!imageSrc || !selectedStudentId) return;

    setStep('analyzing');
    try {
      // Remove data:image/jpeg;base64, prefix
      const base64Data = imageSrc.split(',')[1];
      const result = await analyzeStudentWork(base64Data);
      onScanComplete(selectedStudentId, result.summary, result.errors, imageSrc);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
      setStep('preview');
    }
  };

  if (step === 'select-student') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-bold mb-4">Who is this work for?</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => {
                setSelectedStudentId(student.id);
                setStep('capture');
              }}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex justify-between items-center"
            >
              <span className="font-medium text-gray-900">{student.name}</span>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="secondary" onClick={onCancel} className="w-full">Cancel</Button>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
        <h3 className="text-lg font-medium text-gray-900">Analyzing Work...</h3>
        <p className="text-gray-500 mt-2">Checking grammar, punctuation, and spelling.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {step === 'capture' && (
        <div className="relative flex-1 bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-6">
            <label className="p-3 bg-white/20 backdrop-blur-sm rounded-full cursor-pointer hover:bg-white/30 transition">
              <i className="fas fa-image text-white text-xl"></i>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <button 
              onClick={capture}
              className="h-16 w-16 bg-white rounded-full border-4 border-indigo-500 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            >
              <div className="h-12 w-12 bg-indigo-600 rounded-full"></div>
            </button>
            <button 
              onClick={onCancel}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
            >
               <i className="fas fa-times text-white text-xl"></i>
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && imageSrc && (
        <div className="flex flex-col space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
             <img src={imageSrc} alt="Capture" className="w-full h-auto max-h-[60vh] object-contain" />
          </div>
          <div className="flex space-x-3">
             <Button variant="secondary" onClick={() => setStep('capture')} className="flex-1">
               Retake
             </Button>
             <Button onClick={processImage} className="flex-1" icon={<i className="fas fa-magic"></i>}>
               Analyze Work
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};
