import React, { useState, useEffect, useRef } from 'react';
import { Question, ExamSubmission, StudentProfile, ExamConfig } from '../../types/exam';
import { 
  Timer, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Star, 
  Send, 
  LayoutGrid, 
  Check, 
  X,
  Code2,
  FileQuestion
} from 'lucide-react';

interface ExamRoomProps {
  student: StudentProfile;
  questions: Question[];
  config: ExamConfig;
  onSubmitExam: (submission: ExamSubmission) => void;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({
  student,
  questions,
  config,
  onSubmitExam,
}) => {
  const totalSeconds = (config.timeLimitMinutes || 10) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { selected: number | null; marked: boolean }>>(() => {
    const init: Record<string, { selected: number | null; marked: boolean }> = {};
    questions.forEach((q) => {
      init[q.id] = { selected: null, marked: false };
    });
    return init;
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const hasSubmittedRef = useRef(false);

  // Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            handleFinalSubmission(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLowTime = secondsRemaining <= 120; // 2 minutes warning
  const isCriticalTime = secondsRemaining <= 30; // 30 seconds

  const currentQ = questions[currentIndex];
  const currentState = answers[currentQ?.id] || { selected: null, marked: false };

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selected: optionIndex,
      },
    }));
  };

  const handleClearResponse = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selected: null,
      },
    }));
  };

  const handleToggleMarkReview = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        marked: !prev[currentQ.id].marked,
      },
    }));
  };

  const handleFinalSubmission = (isTimeOut = false) => {
    hasSubmittedRef.current = true;

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const detailedAnswers = questions.map((q) => {
      const state = answers[q.id];
      const selected = state ? state.selected : null;
      const isCorrect = selected === q.correctAnswerIndex;

      if (selected === null) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        questionText: q.question,
        category: q.category,
        options: q.options,
        userAnswerIndex: selected,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const total = questions.length;
    const score = correctCount;
    const percentage = Math.round((correctCount / total) * 100);
    const isPassed = percentage >= config.passingPercentage;
    const timeTaken = totalSeconds - Math.max(0, secondsRemaining);

    const submission: ExamSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentName: student.name,
      rollNumber: student.rollNumber,
      category: student.selectedCategory,
      totalQuestions: total,
      attempted: total - unansweredCount,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      score,
      percentage,
      isPassed,
      timeTakenSeconds: timeTaken,
      allocatedTimeSeconds: totalSeconds,
      submittedAt: new Date().toLocaleString(),
      answers: detailedAnswers,
    };

    onSubmitExam(submission);
  };

  // Stats for confirmation
  const answeredCount = Object.values(answers).filter((a) => a.selected !== null).length;
  const markedCount = Object.values(answers).filter((a) => a.marked).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-3 sm:p-5 gap-4">
      {/* Top Floating / Sticky Exam Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur">
        {/* Student and Subject Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>{student.name}</span>
              <span className="text-slate-400 font-normal">({student.rollNumber})</span>
            </div>
            <div className="text-[11px] text-indigo-400 font-medium">
              Subject: {student.selectedCategory === 'All' ? 'All Subjects Test' : student.selectedCategory}
            </div>
          </div>
        </div>

        {/* Center: Strict Countdown Timer */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono text-sm sm:text-base font-bold transition shadow-inner ${
            isCriticalTime
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-bounce'
              : isLowTime
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-emerald-400'
          }`}
        >
          <Timer className={`w-4 h-4 ${isLowTime ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-semibold">
              Time Remaining
            </span>
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        </div>

        {/* Right: Quick Palette Button (Mobile) & Submit Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            title="Toggle Question Palette"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {/* Main Examination Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left: Active Question Area */}
        <div className="lg:col-span-8 xl:col-span-9 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur">
          <div>
            {/* Question Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                  {currentQ.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${
                  currentQ.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  currentQ.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {currentQ.difficulty}
                </span>
                <span className="text-xs text-slate-500 font-medium">1 Mark</span>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-relaxed mb-4">
              {currentQ.question}
            </h2>

            {/* Code Snippet (if available) */}
            {currentQ.codeSnippet && (
              <div className="mb-5 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Code Snippet
                </div>
                <pre className="p-3.5 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Question Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentState.selected === idx;
                const optionLetter = String.fromCharCode(65 + idx);

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`group p-4 rounded-2xl border cursor-pointer transition flex items-center gap-3.5 select-none ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/30 text-white shadow-md'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/40'
                          : 'bg-slate-900 border-slate-700 text-slate-400 group-hover:border-slate-600'
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span className="text-sm font-medium leading-relaxed">{option}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-white transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-white transition flex items-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearResponse}
                disabled={currentState.selected === null}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center gap-1"
                title="Clear selected option"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>

              <button
                onClick={handleToggleMarkReview}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  currentState.marked
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${currentState.marked ? 'fill-current' : ''}`} />
                <span>{currentState.marked ? 'Flagged' : 'Mark Review'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Navigation Palette (Desktop Sidebar) */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex-col shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <span>Questions Palette</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {answeredCount}/{questions.length} Answered
            </span>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[380px] p-1">
            {questions.map((q, idx) => {
              const state = answers[q.id];
              const isCurrent = idx === currentIndex;
              const isAnswered = state?.selected !== null;
              const isMarked = state?.marked;

              let bgClass = 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700';
              if (isMarked) {
                bgClass = 'bg-amber-500 text-slate-950 font-black border border-amber-400';
              } else if (isAnswered) {
                bgClass = 'bg-emerald-600 text-white font-bold border border-emerald-500 shadow-sm';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl text-xs flex items-center justify-center transition ${bgClass} ${
                    isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-105 z-10' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 inline-block"></span>
                <span>Answered</span>
              </span>
              <span className="font-bold text-slate-300">{answeredCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500 inline-block"></span>
                <span>Marked for Review</span>
              </span>
              <span className="font-bold text-slate-300">{markedCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-950 border border-slate-800 inline-block"></span>
                <span>Not Answered</span>
              </span>
              <span className="font-bold text-slate-300">{unansweredCount}</span>
            </div>

            <div className="flex items-center gap-2 text-indigo-400 pt-1">
              <span className="w-3.5 h-3.5 rounded-md ring-2 ring-indigo-400 bg-slate-900 inline-block"></span>
              <span>Current Question</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Palette Bottom Drawer */}
      {showMobilePalette && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[75vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-400" />
                <span>Question Palette ({answeredCount}/{questions.length} answered)</span>
              </div>
              <button
                onClick={() => setShowMobilePalette(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 overflow-y-auto p-1 flex-1">
              {questions.map((q, idx) => {
                const state = answers[q.id];
                const isCurrent = idx === currentIndex;
                const isAnswered = state?.selected !== null;
                const isMarked = state?.marked;

                let bgClass = 'bg-slate-950 text-slate-400 border border-slate-800';
                if (isMarked) {
                  bgClass = 'bg-amber-500 text-slate-950 font-black border border-amber-400';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold border border-emerald-500';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowMobilePalette(false);
                    }}
                    className={`h-11 rounded-xl text-xs flex items-center justify-center font-bold ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-400 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <FileQuestion className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-1">
              Submit Examination?
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5">
              Please verify your exam summary before final submission.
            </p>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs space-y-2 mb-6">
              <div className="flex justify-between text-slate-300">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Answered:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-medium">
                <span>Marked for Review:</span>
                <span className="font-bold">{markedCount}</span>
              </div>
              <div className="flex justify-between text-rose-400 font-medium">
                <span>Unanswered:</span>
                <span className="font-bold">{unansweredCount}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Time Remaining:</span>
                <span className="font-mono font-bold text-white">{formatTime(secondsRemaining)}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="mb-5 flex items-center gap-2 text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You have {unansweredCount} unanswered questions. They will count as 0 marks.</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Continue Exam
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleFinalSubmission(false);
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/30"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
