import React, { useState } from 'react';
import { Category, ExamConfig } from '../../types/exam';
import { 
  Timer, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Sparkles,
  Smartphone,
  ChevronRight,
  Code2,
  Binary,
  Cpu,
  Globe
} from 'lucide-react';

interface StudentLoginProps {
  onStartExam: (studentName: string, rollNumber: string, category: Category | 'All') => void;
  config: ExamConfig;
  totalQuestionsAvailable: number;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onStartExam,
  config,
  totalQuestionsAvailable,
}) => {
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!rollNumber.trim()) {
      setError('Please enter your roll number or student ID');
      return;
    }
    setError('');
    onStartExam(studentName.trim(), rollNumber.trim().toUpperCase(), category);
  };

  const categories: { label: string; value: Category | 'All'; icon: React.ReactNode; desc: string }[] = [
    { 
      label: 'All Subjects Combined', 
      value: 'All', 
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      desc: 'Java + Data Structures + Python + General Knowledge'
    },
    { 
      label: 'Java Programming', 
      value: 'Java', 
      icon: <Code2 className="w-4 h-4 text-amber-400" />,
      desc: 'OOP, JVM, Concurrency, Collections & Exceptions'
    },
    { 
      label: 'Data Structures & Algorithms', 
      value: 'Data Structures', 
      icon: <Binary className="w-4 h-4 text-emerald-400" />,
      desc: 'Stacks, Queues, Linked Lists, Trees & Complexity'
    },
    { 
      label: 'Python Basics', 
      value: 'Python', 
      icon: <Cpu className="w-4 h-4 text-sky-400" />,
      desc: 'Data Types, Slicing, Comprehensions & Functions'
    },
    { 
      label: 'General Knowledge & Tech', 
      value: 'General Knowledge', 
      icon: <Globe className="w-4 h-4 text-purple-400" />,
      desc: 'Computer Architecture, Pioneers & Tech Milestones'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full py-4 sm:py-8 px-3 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Login Form */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Student Examination Room
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Begin Your Online Test
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enter your student details to start your strictly timed assessment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Student Name *
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Aditi Sharma"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white text-sm outline-none transition placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Roll Number / Student ID *
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. CS2026-101"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white text-sm outline-none transition placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Select Exam Subject
              </label>
              <div className="space-y-2">
                {categories.map((c) => {
                  const isSelected = category === c.value;
                  return (
                    <div
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600/30' : 'bg-slate-900'}`}>
                          {c.icon}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {c.label}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {c.desc}
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Enter Exam Room</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Exam Rules & Properties */}
        <div className="lg:col-span-5 space-y-4">
          {/* Rules Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span>Exam Properties & Rules</span>
            </h2>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <Timer className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Strict Time Limit</div>
                  <p className="text-slate-400 mt-0.5">
                    You have <strong className="text-amber-400">{config.timeLimitMinutes} minutes</strong> to complete the exam. The exam automatically submits when the countdown reaches 00:00!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Scoring & Passing Criteria</div>
                  <p className="text-slate-400 mt-0.5">
                    Passing threshold is <strong className="text-emerald-400">{config.passingPercentage}%</strong>. Each correct answer awards 1 mark with no negative marking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <Smartphone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Device Responsiveness</div>
                  <p className="text-slate-400 mt-0.5">
                    Screen responds dynamically to smart phones, tablets, laptops, and desktop computers. Question palette collapses neatly on mobile.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <BookOpen className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Instant Solution Review</div>
                  <p className="text-slate-400 mt-0.5">
                    Upon exam completion, view your comprehensive score report with detailed solutions and educator recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Question Bank: {totalQuestionsAvailable} questions</span>
              <span>Single Attempt per Session</span>
            </div>
          </div>

          {/* Educational Quick Links Card */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 text-xs">
            <div className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
              <span>Official Video References:</span>
            </div>
            <p className="text-slate-400 text-[11px] mb-2">
              Prepare syllabus concepts from recommended creators:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <a 
                href="https://www.youtube.com/@JennyslecturesCSIT" 
                target="_blank" 
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-indigo-950/60 border border-slate-800 text-slate-300 hover:text-white transition text-center truncate block"
              >
                Jenny's CS IT
              </a>
              <a 
                href="https://www.youtube.com/@shradhaKD" 
                target="_blank" 
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-indigo-950/60 border border-slate-800 text-slate-300 hover:text-white transition text-center truncate block"
              >
                Shradha Khapra
              </a>
              <a 
                href="https://www.youtube.com/@ApnaCollegeOfficial" 
                target="_blank" 
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-indigo-950/60 border border-slate-800 text-slate-300 hover:text-white transition text-center truncate block"
              >
                Apna College
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
