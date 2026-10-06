/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Question, 
  Category, 
  StudentProfile, 
  ExamSubmission, 
  ExamConfig 
} from './types/exam';
import { 
  loadQuestions, 
  saveQuestions, 
  resetQuestionsToDefault, 
  loadSubmissions, 
  saveSubmission, 
  deleteSubmission, 
  clearAllSubmissions, 
  loadConfig, 
  saveConfig 
} from './services/storage';
import { DEFAULT_QUESTIONS } from './data/defaultQuestions';
import {
  subscribeQuestions,
  saveQuestionToFirestore,
  deleteQuestionFromFirestore,
  seedQuestionsToFirestore,
  subscribeSubmissions,
  saveSubmissionToFirestore,
  deleteSubmissionFromFirestore,
  clearAllSubmissionsFromFirestore,
  subscribeExamConfig,
  saveExamConfigToFirestore,
  firebaseConfig,
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { StudentLogin } from './components/StudentPortal/StudentLogin';
import { ExamRoom } from './components/StudentPortal/ExamRoom';
import { ExamResult } from './components/StudentPortal/ExamResult';
import { AdminLogin } from './components/AdminPortal/AdminLogin';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { ResourcesModal } from './components/ResourcesModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Global Data State
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(() => loadSubmissions());
  const [config, setConfig] = useState<ExamConfig>(() => loadConfig());

  // Navigation & Session State
  const [currentTab, setCurrentTab] = useState<'student' | 'admin'>('student');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Student Exam Session State
  const [isExamInProgress, setIsExamInProgress] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<ExamSubmission | null>(null);

  // Initialize Firebase Realtime Listeners
  useEffect(() => {
    // 1. Questions Listener
    const unsubscribeQuestions = subscribeQuestions(
      (firestoreQuestions) => {
        if (firestoreQuestions && firestoreQuestions.length > 0) {
          setQuestions(firestoreQuestions);
          saveQuestions(firestoreQuestions);
        } else {
          // If Firestore is empty on first run, seed default questions to Firebase
          seedQuestionsToFirestore(DEFAULT_QUESTIONS);
        }
      },
      (error) => {
        console.warn('Firebase questions sync falling back to local storage', error);
      }
    );

    // 2. Submissions Listener
    const unsubscribeSubmissions = subscribeSubmissions(
      (firestoreSubmissions) => {
        if (firestoreSubmissions) {
          setSubmissions(firestoreSubmissions);
          // Sync with local cache
          localStorage.setItem('smartexam_submissions_v1', JSON.stringify(firestoreSubmissions));
        }
      },
      (error) => {
        console.warn('Firebase submissions sync falling back to local storage', error);
      }
    );

    // 3. Config Listener
    const unsubscribeConfig = subscribeExamConfig(
      (firestoreConfig) => {
        if (firestoreConfig) {
          setConfig(firestoreConfig);
          saveConfig(firestoreConfig);
        }
      },
      (error) => {
        console.warn('Firebase config sync falling back to local storage', error);
      }
    );

    return () => {
      unsubscribeQuestions();
      unsubscribeSubmissions();
      unsubscribeConfig();
    };
  }, []);

  // Update questions handler
  const handleUpdateQuestions = async (updated: Question[]) => {
    setQuestions(updated);
    saveQuestions(updated);

    // Find any added/updated questions to sync to Firestore
    for (const q of updated) {
      await saveQuestionToFirestore(q);
    }
  };

  // Reset default questions
  const handleResetQuestions = async () => {
    const defaults = resetQuestionsToDefault();
    setQuestions(defaults);
    await seedQuestionsToFirestore(defaults);
  };

  // Update exam config
  const handleUpdateConfig = async (newConfig: ExamConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
    await saveExamConfigToFirestore(newConfig);
  };

  // Delete single submission
  const handleDeleteSubmission = async (id: string) => {
    const updated = deleteSubmission(id);
    setSubmissions(updated);
    await deleteSubmissionFromFirestore(id);
  };

  // Clear all submissions
  const handleClearAllSubmissions = async () => {
    await clearAllSubmissionsFromFirestore(submissions);
    clearAllSubmissions();
    setSubmissions([]);
  };

  // Start exam flow
  const handleStartExam = (name: string, rollNumber: string, category: Category | 'All') => {
    const student: StudentProfile = {
      name,
      rollNumber,
      selectedCategory: category,
      examStartTime: Date.now(),
    };
    setCurrentStudent(student);

    // Filter questions
    let pool = category === 'All' ? [...questions] : questions.filter((q) => q.category === category);
    if (pool.length === 0) {
      pool = [...questions];
    }

    // Shuffle if enabled
    if (config.shuffleQuestions) {
      pool = [...pool].sort(() => Math.random() - 0.5);
    }

    const limit = Math.min(pool.length, config.questionsPerExam || 10);
    const selectedQuestions = pool.slice(0, limit);

    setExamQuestions(selectedQuestions);
    setCurrentSubmission(null);
    setIsExamInProgress(true);
  };

  // Submit exam flow
  const handleSubmitExam = async (submission: ExamSubmission) => {
    // Save to local cache first
    saveSubmission(submission);
    setSubmissions((prev) => [submission, ...prev.filter((s) => s.id !== submission.id)]);
    setCurrentSubmission(submission);
    setIsExamInProgress(false);

    // Async sync to Firebase
    await saveSubmissionToFirestore(submission);
  };

  // Retake exam flow
  const handleRetakeExam = () => {
    setCurrentSubmission(null);
    setCurrentStudent(null);
    setIsExamInProgress(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenResources={() => setIsResourcesOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={() => setIsAdminLoggedIn(false)}
        isExamInProgress={isExamInProgress}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* STUDENT PORTAL */}
        {currentTab === 'student' && (
          <>
            {isExamInProgress && currentStudent ? (
              <ExamRoom
                student={currentStudent}
                questions={examQuestions}
                config={config}
                onSubmitExam={handleSubmitExam}
              />
            ) : currentSubmission ? (
              <ExamResult
                submission={currentSubmission}
                onRetake={handleRetakeExam}
                onOpenResources={() => setIsResourcesOpen(true)}
                onOpenExport={() => setIsExportOpen(true)}
              />
            ) : (
              <StudentLogin
                onStartExam={handleStartExam}
                config={config}
                totalQuestionsAvailable={questions.length}
              />
            )}
          </>
        )}

        {/* ADMIN PORTAL */}
        {currentTab === 'admin' && (
          <>
            {isAdminLoggedIn ? (
              <AdminDashboard
                questions={questions}
                submissions={submissions}
                config={config}
                onUpdateQuestions={handleUpdateQuestions}
                onResetQuestions={handleResetQuestions}
                onUpdateConfig={handleUpdateConfig}
                onDeleteSubmission={handleDeleteSubmission}
                onClearAllSubmissions={handleClearAllSubmissions}
              />
            ) : (
              <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>SmartExam Pro • Multi-Device Examination System</span>
            <span className="text-amber-400/80 font-mono text-[11px]">• Connected to Firebase: {firebaseConfig.projectId}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsResourcesOpen(true)}
              className="hover:text-indigo-400 transition"
            >
              Educational Resources
            </button>
            <span>•</span>
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              Get HTML / Zip
            </button>
            <span>•</span>
            <span className="text-slate-600">Admin: sagar</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ResourcesModal
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        questions={questions}
        submissions={submissions}
        config={config}
      />
    </div>
  );
}
