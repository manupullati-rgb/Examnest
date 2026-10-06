import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ExamSubmission } from '../../types/exam';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Printer, 
  ExternalLink,
  BookOpen,
  Filter,
  Code2,
  AlertCircle
} from 'lucide-react';

interface ExamResultProps {
  submission: ExamSubmission;
  onRetake: () => void;
  onOpenResources: () => void;
  onOpenExport?: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({
  submission,
  onRetake,
  onOpenResources,
  onOpenExport,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');

  useEffect(() => {
    if (submission.isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [submission.isPassed]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Group by category for performance analysis
  const categoryStats: Record<string, { total: number; correct: number }> = {};
  submission.answers.forEach((ans) => {
    if (!categoryStats[ans.category]) {
      categoryStats[ans.category] = { total: 0, correct: 0 };
    }
    categoryStats[ans.category].total++;
    if (ans.isCorrect) categoryStats[ans.category].correct++;
  });

  const filteredAnswers = submission.answers.filter((ans) => {
    if (filterMode === 'correct') return ans.isCorrect;
    if (filterMode === 'incorrect') return !ans.isCorrect;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-4 sm:py-8 px-3 sm:px-4 space-y-6">
      {/* Top Result Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        {/* Glow backdrop */}
        <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -z-10 pointer-events-none opacity-20 ${
          submission.isPassed ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                  submission.isPassed
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {submission.isPassed ? '🏆 PASSED & QUALIFIED' : '⚠️ NEEDS IMPROVEMENT'}
              </span>
              <span className="text-xs text-slate-400">
                Submitted on {submission.submittedAt}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {submission.studentName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Roll No: <span className="font-mono text-slate-200">{submission.rollNumber}</span> • Subject:{' '}
              <span className="text-indigo-400 font-semibold">{submission.category}</span>
            </p>
          </div>

          {/* Big Score Dial */}
          <div className="text-center p-4 rounded-2xl bg-slate-950 border border-slate-800/80 min-w-[150px]">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
              Total Score
            </div>
            <div className={`text-4xl font-black ${submission.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {submission.score}/{submission.totalQuestions}
            </div>
            <div className="text-sm font-bold text-slate-300 mt-0.5">
              {submission.percentage}%
            </div>
          </div>
        </div>

        {/* 4 Score Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Correct</span>
            </div>
            <div className="text-xl font-black text-emerald-400">
              {submission.correctAnswers}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Wrong</span>
            </div>
            <div className="text-xl font-black text-rose-400">
              {submission.wrongAnswers}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Unanswered</span>
            </div>
            <div className="text-xl font-black text-slate-400">
              {submission.unanswered}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Time Taken</span>
            </div>
            <div className="text-lg font-black text-amber-400">
              {formatTime(submission.timeTakenSeconds)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button
            onClick={onRetake}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Exam / New Student</span>
          </button>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="py-3 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs sm:text-sm transition flex items-center gap-2 border border-emerald-500/30 shadow-sm"
            >
              <span>📦 Download Exam ZIP Folder</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center gap-2 border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onOpenResources}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold text-xs sm:text-sm transition flex items-center gap-2 border border-slate-700"
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Resources</span>
          </button>
        </div>
      </div>

      {/* BotScript Automated Score Diagnostic Engine */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
              &gt;_
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>BotScript Diagnostic Engine (JavaScript Evaluation)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  v2.4
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Automated performance diagnostic & targeted YouTube syllabus roadmap</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold hidden sm:inline">
            Status: Evaluation Complete
          </span>
        </div>

        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs space-y-3">
          <div className="text-slate-400">
            <span className="text-indigo-400">&gt; evaluate_student_profile:</span> {submission.studentName} ({submission.rollNumber})
          </div>
          <div className="text-slate-300">
            <span className="text-emerald-400">&gt; score_metric:</span> {submission.score}/{submission.totalQuestions} ({submission.percentage}%) | Accuracy: {Math.round((submission.correctAnswers / Math.max(1, submission.attempted)) * 100)}% | Pace: {Math.round(submission.timeTakenSeconds / Math.max(1, submission.totalQuestions))}s/question
          </div>

          {/* Diagnostic feedback per subject */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-slate-300 font-sans">
            <div className="text-xs font-bold text-indigo-300 font-mono">
              &gt; botscript_recommender:
            </div>
            
            {submission.percentage >= 80 ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs">
                🌟 <strong>Outstanding Performance!</strong> You showed exceptional mastery. Sharpen your advanced algorithms & competitive programming questions on <strong>Jenny's lectures CS IT</strong>.
              </div>
            ) : submission.percentage >= 50 ? (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-xs">
                👍 <strong>Good Effort!</strong> You passed the assessment. Review missed questions below and brush up on core concepts on <strong>Shradha Khapra</strong> and <strong>Apna College</strong>.
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs">
                ⚠️ <strong>Need Targeted Revision:</strong> Recommended step-by-step revision:
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-300">
                  <li><strong>Data Structures:</strong> Watch Jenny's lectures CS IT playlist on Trees, Stacks, and Graphs.</li>
                  <li><strong>Java OOP & Syntax:</strong> Watch Shradha Khapra's Complete Java placement series.</li>
                  <li><strong>Python Basics:</strong> Watch Apna College's 1-shot Python complete course.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject-Wise Mastery Breakdown */}
      {Object.keys(categoryStats).length > 1 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-400" />
            <span>Subject-Wise Performance Breakdown</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(categoryStats).map(([cat, stats]) => {
              const catPercent = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={cat} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-200">{cat}</span>
                    <span className="text-slate-400 font-mono">
                      {stats.correct}/{stats.total} ({catPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        catPercent >= 70 ? 'bg-emerald-500' : catPercent >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Educational Channel Links */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-sky-950/30 border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Recommended YouTube Educators</h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Free Concept Lectures</span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Prepare your questions and algorithms from these top-tier YouTube channels:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="https://www.youtube.com/@JennyslecturesCSIT"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="font-bold text-sm text-white group-hover:text-indigo-400 transition flex items-center justify-between">
                <span>Jenny's lectures CS IT</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Legendary tutorials on Data Structures, Algorithms, OS, and C/Java concepts.
              </div>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-indigo-400">@JennyslecturesCSIT</div>
          </a>

          <a
            href="https://www.youtube.com/@shradhaKD"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="font-bold text-sm text-white group-hover:text-indigo-400 transition flex items-center justify-between">
                <span>Shradha Khapra</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Foundations in Java, DSA placements, Python, and coding interviews.
              </div>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-indigo-400">@shradhaKD</div>
          </a>

          <a
            href="https://www.youtube.com/@ApnaCollegeOfficial"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="font-bold text-sm text-white group-hover:text-indigo-400 transition flex items-center justify-between">
                <span>Apna College</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Full-stack tutorials, complete DSA sheets, Python series, and tech guidance.
              </div>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-indigo-400">@ApnaCollegeOfficial</div>
          </a>
        </div>
      </div>

      {/* Question-By-Question Solutions Review */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Questions & Solutions Review
            </h2>
            <p className="text-xs text-slate-400">
              Verify correct answers and read explanations for every question.
            </p>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({submission.answers.length})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterMode === 'incorrect' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Incorrect ({submission.wrongAnswers + submission.unanswered})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterMode === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Correct ({submission.correctAnswers})
            </button>
          </div>
        </div>

        {/* List of answers */}
        <div className="space-y-4">
          {filteredAnswers.map((item, idx) => {
            const hasAnswered = item.userAnswerIndex !== null;
            const originalIndex = submission.answers.findIndex((a) => a.questionId === item.questionId);

            return (
              <div
                key={item.questionId}
                className={`p-5 rounded-2xl border text-xs leading-relaxed transition ${
                  item.isCorrect
                    ? 'bg-slate-950/60 border-emerald-500/30'
                    : hasAnswered
                    ? 'bg-slate-950/60 border-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold">
                      Q{originalIndex + 1}
                    </span>
                    <span className="text-slate-400 font-semibold">{item.category}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      item.isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : hasAnswered
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.isCorrect ? 'Correct' : hasAnswered ? 'Incorrect' : 'Skipped'}
                  </span>
                </div>

                {/* Question */}
                <p className="text-sm font-semibold text-white mb-3">{item.questionText}</p>

                {/* Options display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {item.options.map((opt, oIdx) => {
                    const isCorrectChoice = oIdx === item.correctAnswerIndex;
                    const isUserChoice = oIdx === item.userAnswerIndex;

                    let optBg = 'bg-slate-900 border-slate-800 text-slate-400';
                    if (isCorrectChoice) {
                      optBg = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold';
                    } else if (isUserChoice && !item.isCorrect) {
                      optBg = 'bg-rose-500/10 border-rose-500/40 text-rose-300 line-through';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${optBg}`}
                      >
                        <span className="w-5 h-5 rounded-md border border-current flex items-center justify-center text-[10px] font-bold">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="flex-1 truncate">{opt}</span>
                        {isCorrectChoice && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {isUserChoice && !item.isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation and Solution */}
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-slate-300">
                  <div className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Solution & Explanation:</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{item.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
