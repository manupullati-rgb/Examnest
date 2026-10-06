import React, { useState } from 'react';
import { 
  Question, 
  Category, 
  ExamSubmission, 
  ExamConfig 
} from '../../types/exam';
import { 
  Users, 
  HelpCircle, 
  PlusCircle, 
  Settings, 
  Trash2, 
  Edit3, 
  Search, 
  Download, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Code2, 
  Sliders, 
  Sparkles, 
  X,
  BarChart3,
  TrendingUp,
  Award,
  Flame,
  Calendar,
  Activity,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';

interface AdminDashboardProps {
  questions: Question[];
  submissions: ExamSubmission[];
  config: ExamConfig;
  onUpdateQuestions: (updated: Question[]) => void;
  onResetQuestions: () => void;
  onUpdateConfig: (updated: ExamConfig) => void;
  onDeleteSubmission: (id: string) => void;
  onClearAllSubmissions: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  questions,
  submissions,
  config,
  onUpdateQuestions,
  onResetQuestions,
  onUpdateConfig,
  onDeleteSubmission,
  onClearAllSubmissions,
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'questions' | 'add' | 'settings'>('results');

  // Search & Filters for Results
  const [searchStudent, setSearchStudent] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Passed' | 'Failed'>('All');
  const [selectedStudentSheet, setSelectedStudentSheet] = useState<ExamSubmission | null>(null);
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<string>('All');
  const [activeHeatmapSlotInfo, setActiveHeatmapSlotInfo] = useState<{ day: string; slot: string; count: number; students: string[] } | null>(null);

  // Search & Filters for Questions
  const [searchQuestion, setSearchQuestion] = useState('');
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<string>('All');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Add Question Form State
  const [newCategory, setNewCategory] = useState<Category>('Java');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [newCorrectIndex, setNewCorrectIndex] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Settings State
  const [timeLimit, setTimeLimit] = useState(config.timeLimitMinutes);
  const [passingScore, setPassingScore] = useState(config.passingPercentage);
  const [questionsCount, setQuestionsCount] = useState(config.questionsPerExam);
  const [shuffleQuestions, setShuffleQuestions] = useState(config.shuffleQuestions);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchName = sub.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      sub.rollNumber.toLowerCase().includes(searchStudent.toLowerCase());
    const matchSubject = filterSubject === 'All' || sub.category === filterSubject;
    const matchStatus = filterStatus === 'All' || (filterStatus === 'Passed' ? sub.isPassed : !sub.isPassed);
    return matchName && matchSubject && matchStatus;
  });

  // Filter Questions
  const filteredQuestions = questions.filter((q) => {
    const matchText = q.question.toLowerCase().includes(searchQuestion.toLowerCase());
    const matchCat = questionCategoryFilter === 'All' || q.category === questionCategoryFilter;
    return matchText && matchCat;
  });

  // Export Results to CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['Student Name', 'Roll Number', 'Subject', 'Score', 'Total Questions', 'Percentage', 'Passed', 'Time Taken (sec)', 'Submitted At'];
    const rows = submissions.map((s) => [
      `"${s.studentName}"`,
      `"${s.rollNumber}"`,
      `"${s.category}"`,
      s.score,
      s.totalQuestions,
      `${s.percentage}%`,
      s.isPassed ? 'Yes' : 'No',
      s.timeTakenSeconds,
      `"${s.submittedAt}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartexam-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Add New Question
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      setFormErrorMessage('Please enter question prompt');
      return;
    }
    if (newOptions.some((opt) => !opt.trim())) {
      setFormErrorMessage('Please fill in all 4 options');
      return;
    }
    if (!newExplanation.trim()) {
      setFormErrorMessage('Please write a detailed explanation and solution');
      return;
    }

    const newQ: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category: newCategory,
      question: newQuestionText.trim(),
      codeSnippet: newCodeSnippet.trim() || undefined,
      options: newOptions.map((o) => o.trim()),
      correctAnswerIndex: newCorrectIndex,
      explanation: newExplanation.trim(),
      difficulty: newDifficulty,
    };

    onUpdateQuestions([newQ, ...questions]);
    setFormErrorMessage('');
    setFormSuccessMessage(`Question added successfully under ${newCategory}!`);

    // Reset fields
    setNewQuestionText('');
    setNewCodeSnippet('');
    setNewOptions(['', '', '', '']);
    setNewExplanation('');
    setTimeout(() => setFormSuccessMessage(''), 3000);
  };

  // Handle Delete Question
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      onUpdateQuestions(questions.filter((q) => q.id !== id));
    }
  };

  // Handle Save Edited Question
  const handleSaveEditedQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    const updated = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    onUpdateQuestions(updated);
    setEditingQuestion(null);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newConf: ExamConfig = {
      timeLimitMinutes: Number(timeLimit),
      passingPercentage: Number(passingScore),
      questionsPerExam: Number(questionsCount),
      shuffleQuestions,
      allowReviewAfterSubmission: true,
    };
    onUpdateConfig(newConf);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Quick stats
  const totalSubmissionsCount = submissions.length;
  const passedCount = submissions.filter((s) => s.isPassed).length;
  const passRate = totalSubmissionsCount > 0 ? Math.round((passedCount / totalSubmissionsCount) * 100) : 0;
  const averageScore = totalSubmissionsCount > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.percentage, 0) / totalSubmissionsCount)
    : 0;

  // Recharts Data: Subject Performance Metrics
  const subjectColors: Record<string, string> = {
    'Java': '#6366f1', // Indigo
    'Data Structures': '#10b981', // Emerald
    'Python': '#38bdf8', // Sky
    'General Knowledge': '#f59e0b', // Amber
  };

  const subjectPerformanceData = ['Java', 'Data Structures', 'Python', 'General Knowledge'].map((subj) => {
    let totalQuestionsAttempted = 0;
    let correctAnswersCount = 0;
    let categorySum = 0;
    let categoryCount = 0;

    submissions.forEach((sub) => {
      // 1. Direct category exams
      if (sub.category === subj) {
        categorySum += sub.percentage;
        categoryCount++;
      }
      // 2. Question-level breakdown from all submissions
      const matchedAnswers = sub.answers?.filter((a) => a.category === subj) || [];
      matchedAnswers.forEach((a) => {
        totalQuestionsAttempted++;
        if (a.isCorrect) correctAnswersCount++;
      });
    });

    const averageScore = totalQuestionsAttempted > 0
      ? Math.round((correctAnswersCount / totalQuestionsAttempted) * 100)
      : categoryCount > 0
      ? Math.round(categorySum / categoryCount)
      : 0;

    return {
      subject: subj,
      shortName: subj === 'Data Structures' ? 'DSA' : subj === 'General Knowledge' ? 'GK' : subj,
      averageScore,
      correctCount: correctAnswersCount,
      totalQuestions: totalQuestionsAttempted,
      color: subjectColors[subj] || '#6366f1',
    };
  });

  // Recharts Data: Score Range Distribution
  const scoreDistributionData = [
    { range: '90-100%', label: 'Distinction', count: submissions.filter((s) => s.percentage >= 90).length, fill: '#10b981' },
    { range: '75-89%', label: 'First Class', count: submissions.filter((s) => s.percentage >= 75 && s.percentage < 90).length, fill: '#6366f1' },
    { range: '50-74%', label: 'Pass', count: submissions.filter((s) => s.percentage >= 50 && s.percentage < 75).length, fill: '#f59e0b' },
    { range: '<50%', label: 'Needs Review', count: submissions.filter((s) => s.percentage < 50).length, fill: '#f43f5e' },
  ];

  // Recharts & Matrix Heatmap: Peak Exam Activity Hours Throughout The Week
  const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TIME_SLOTS = [
    { label: '00:00 - 04:00', name: 'Late Night', start: 0, end: 4 },
    { label: '04:00 - 08:00', name: 'Early Morning', start: 4, end: 8 },
    { label: '08:00 - 12:00', name: 'Morning', start: 8, end: 12 },
    { label: '12:00 - 16:00', name: 'Afternoon', start: 12, end: 16 },
    { label: '16:00 - 20:00', name: 'Evening', start: 16, end: 20 },
    { label: '20:00 - 24:00', name: 'Night', start: 20, end: 24 },
  ];

  const getWeekdayIndex = (dayNum: number) => (dayNum === 0 ? 6 : dayNum - 1);

  const heatmapMatrix = WEEK_DAYS.map((dayName, dIdx) => ({
    dayName,
    dayIndex: dIdx,
    slots: TIME_SLOTS.map((slot, sIdx) => ({
      slotIndex: sIdx,
      slotLabel: slot.label,
      slotName: slot.name,
      count: 0,
      students: [] as string[],
    })),
  }));

  const hourlyActivityData = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    hourLabel: `${h.toString().padStart(2, '0')}:00`,
    timeBand: `${h.toString().padStart(2, '0')}:00 - ${((h + 1) % 24).toString().padStart(2, '0')}:00`,
    submissions: 0,
    students: [] as string[],
  }));

  submissions.forEach((sub) => {
    let subDate = new Date();
    const parts = sub.id?.split('_');
    if (parts && parts[1] && !isNaN(Number(parts[1]))) {
      const d = new Date(Number(parts[1]));
      if (!isNaN(d.getTime())) subDate = d;
    } else if (sub.submittedAt) {
      const d = new Date(sub.submittedAt);
      if (!isNaN(d.getTime())) subDate = d;
    }

    const dayIdx = getWeekdayIndex(subDate.getDay());
    const hour = subDate.getHours();

    const slotIdx = TIME_SLOTS.findIndex((s) => hour >= s.start && hour < s.end);
    if (slotIdx !== -1 && heatmapMatrix[dayIdx]) {
      heatmapMatrix[dayIdx].slots[slotIdx].count++;
      if (!heatmapMatrix[dayIdx].slots[slotIdx].students.includes(sub.studentName)) {
        heatmapMatrix[dayIdx].slots[slotIdx].students.push(sub.studentName);
      }
    }

    if (selectedHeatmapDay === 'All' || WEEK_DAYS[dayIdx] === selectedHeatmapDay) {
      if (hourlyActivityData[hour]) {
        hourlyActivityData[hour].submissions++;
        if (!hourlyActivityData[hour].students.includes(sub.studentName)) {
          hourlyActivityData[hour].students.push(sub.studentName);
        }
      }
    }
  });

  let peakActivitySlot = { day: 'All Week', slot: '12:00 - 16:00 (Afternoon)', count: 0 };
  heatmapMatrix.forEach((d) => {
    d.slots.forEach((s) => {
      if (s.count > peakActivitySlot.count) {
        peakActivitySlot = { day: d.dayName, slot: `${s.slotLabel} (${s.slotName})`, count: s.count };
      }
    });
  });

  let peakHourEntry = { hourLabel: '14:00', count: 0 };
  hourlyActivityData.forEach((item) => {
    if (item.submissions > peakHourEntry.count) {
      peakHourEntry = { hourLabel: item.hourLabel, count: item.submissions };
    }
  });

  return (
    <div className="max-w-7xl mx-auto w-full py-4 sm:py-8 px-3 sm:px-4 space-y-6">
      {/* Header with Quick Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Administrator Control Panel</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
              Admin: sagar
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Prepare questions & solutions across Java, DSA, Python, and GK, monitor student results in real time.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'results'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Results ({submissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'add'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Rules & Timer</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RESULTS CHECKING */}
      {activeTab === 'results' && (
        <div className="space-y-5">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Total Exams Taken</div>
              <div className="text-2xl font-black text-white mt-1">{totalSubmissionsCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Pass Rate</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{passRate}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Average Percentage</div>
              <div className="text-2xl font-black text-indigo-400 mt-1">{averageScore}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Questions Available</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{questions.length}</div>
            </div>
          </div>

          {/* Visual Performance Metrics: Recharts Visual Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 1: Average Scores Per Subject Bar Chart */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Average Score per Subject
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Performance benchmark across Java, DSA, Python, and GK
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Recharts Visual
                </span>
              </div>

              {/* Chart Body */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformanceData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="shortName" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      unit="%" 
                      stroke="#64748b" 
                      fontSize={11}
                      tickLine={false}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur text-xs space-y-1">
                              <p className="font-bold text-white text-sm">{item.subject}</p>
                              <p className="text-emerald-400 font-bold">Average Score: {item.averageScore}%</p>
                              <p className="text-slate-400">Questions Attempted: {item.totalQuestions}</p>
                              <p className="text-slate-400">Correct Answers: {item.correctCount}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="averageScore" radius={[8, 8, 0, 0]} maxBarSize={48}>
                      {subjectPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 mt-2 text-[11px]">
                {subjectPerformanceData.map((item) => (
                  <div key={item.subject} className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400 truncate">{item.shortName}:</span>
                    <span className="font-bold text-white">{item.averageScore}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Grade & Score Range Distribution */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Score Distribution
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Student counts across grade brackets
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {submissions.length} Students
                </span>
              </div>

              {/* Distribution Chart Body */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistributionData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis 
                      type="number" 
                      allowDecimals={false} 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="range" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8' }}
                      width={65}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl shadow-2xl backdrop-blur text-xs space-y-0.5">
                              <p className="font-bold text-white">{item.range} ({item.label})</p>
                              <p className="text-indigo-400 font-semibold">{item.count} student{item.count === 1 ? '' : 's'}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={28}>
                      {scoreDistributionData.map((entry, index) => (
                        <Cell key={`cell-dist-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Distribution Summary */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2 text-[11px] text-slate-400">
                <span>Passing threshold: {config.passingPercentage}%</span>
                <span className="font-semibold text-emerald-400">Pass Rate: {passRate}%</span>
              </div>
            </div>
          </div>

          {/* Chart 3: Weekly Peak Exam Activity Heatmap & Hourly Recharts Visualization */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur space-y-6">
            {/* Header with Peak Highlight & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Peak Exam Activity Heatmap (Weekly & Hourly)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                      Recharts & Matrix
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Live heatmap showing exam traffic density throughout the week & peak hours
                  </p>
                </div>
              </div>

              {/* Peak Insights Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Peak Slot:</span>
                  <span className="font-bold text-white">
                    {peakActivitySlot.count > 0 ? `${peakActivitySlot.day} • ${peakActivitySlot.slot}` : '12:00 - 16:00 (Afternoon)'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    {peakActivitySlot.count} exams
                  </span>
                </div>
              </div>
            </div>

            {/* Heatmap Grid Matrix (7 Days x 6 Time Slots) */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Activity Matrix: Days vs Time Blocks</span>
                </div>
                {/* Intensity Legend */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Intensity:</span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800 inline-block" /> 0
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-950/60 border border-emerald-800/60 inline-block" /> 1-2
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-800/80 border border-emerald-600 inline-block" /> 3-4
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> 5+ Peak
                  </span>
                </div>
              </div>

              {/* Scrollable table container for mobile */}
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[640px]">
                  {/* Column Headers (Time Slots) */}
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-medium text-slate-400">
                    <div className="text-left pl-2 font-bold text-slate-500 uppercase">Day / Slot</div>
                    {TIME_SLOTS.map((slot) => (
                      <div key={slot.label} className="p-1 rounded bg-slate-950/50 border border-slate-800/50">
                        <div className="font-bold text-slate-300 truncate">{slot.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{slot.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Rows (Days of week) */}
                  <div className="space-y-2">
                    {heatmapMatrix.map((dayRow) => (
                      <div key={dayRow.dayName} className="grid grid-cols-7 gap-2 items-center">
                        {/* Day Label */}
                        <div className="text-xs font-bold text-slate-300 pl-2 truncate flex items-center justify-between pr-2">
                          <span>{dayRow.dayName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {dayRow.slots.reduce((a, b) => a + b.count, 0)}
                          </span>
                        </div>

                        {/* 6 Slot Cells */}
                        {dayRow.slots.map((slot) => {
                          let cellBg = 'bg-slate-950/80 border-slate-800/80 text-slate-600 hover:border-slate-700';
                          if (slot.count >= 5) {
                            cellBg = 'bg-emerald-500 border-emerald-400 text-slate-950 font-black shadow-md shadow-emerald-500/20';
                          } else if (slot.count >= 3) {
                            cellBg = 'bg-emerald-800/80 border-emerald-600/80 text-emerald-100 font-bold';
                          } else if (slot.count >= 1) {
                            cellBg = 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300 font-semibold';
                          }

                          return (
                            <div
                              key={slot.slotIndex}
                              onMouseEnter={() =>
                                setActiveHeatmapSlotInfo({
                                  day: dayRow.dayName,
                                  slot: `${slot.slotLabel} (${slot.slotName})`,
                                  count: slot.count,
                                  students: slot.students,
                                })
                              }
                              className={`h-11 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition relative group ${cellBg}`}
                            >
                              <span className="text-xs">{slot.count}</span>
                              <span className="text-[9px] uppercase tracking-tighter opacity-70">
                                {slot.count === 1 ? 'exam' : 'exams'}
                              </span>

                              {/* Tooltip Hover Overlay */}
                              <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-48 p-2.5 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl text-[11px] text-left pointer-events-none">
                                <div className="font-bold text-white">{dayRow.dayName}</div>
                                <div className="text-indigo-400 text-[10px]">{slot.slotLabel} ({slot.slotName})</div>
                                <div className="text-emerald-400 font-semibold mt-1">
                                  {slot.count} submission{slot.count === 1 ? '' : 's'}
                                </div>
                                {slot.students.length > 0 && (
                                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                    Students: {slot.students.slice(0, 3).join(', ')}{slot.students.length > 3 ? '...' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Hourly Activity Distribution Area/Bar Chart */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    24-Hour Peak Exam Activity Timeline (Recharts)
                  </h4>
                </div>

                {/* Day selector pills */}
                <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-[11px]">
                  {['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedHeatmapDay(day)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        selectedHeatmapDay === day
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {day === 'All' ? 'All Week' : day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recharts 24-Hour Bar Chart */}
              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="hourLabel" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                      interval={1}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          const isPeak = item.submissions > 0 && item.submissions >= peakHourEntry.count;
                          return (
                            <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur text-xs space-y-1">
                              <p className="font-bold text-white">{item.timeBand}</p>
                              <p className="text-emerald-400 font-bold">
                                {item.submissions} student exam submission{item.submissions === 1 ? '' : 's'}
                              </p>
                              {isPeak && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                                  🔥 Peak Hour of {selectedHeatmapDay === 'All' ? 'the Week' : selectedHeatmapDay}
                                </span>
                              )}
                              {item.students.length > 0 && (
                                <p className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">
                                  Recent: {item.students.slice(0, 4).join(', ')}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="submissions" radius={[6, 6, 0, 0]} maxBarSize={32}>
                      {hourlyActivityData.map((entry, index) => {
                        const isPeak = entry.submissions > 0 && entry.submissions >= peakHourEntry.count;
                        return (
                          <Cell
                            key={`cell-hour-${index}`}
                            fill={isPeak ? '#f59e0b' : entry.submissions > 0 ? '#10b981' : '#334155'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                    <span>Active Submissions</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                    <span>Peak Hour ({peakHourEntry.hourLabel})</span>
                  </span>
                </div>
                <span>Filtering: <strong>{selectedHeatmapDay === 'All' ? 'Entire Week' : selectedHeatmapDay}</strong></span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
              >
                <option value="All">All Subjects</option>
                <option value="Java">Java</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Python">Python</option>
                <option value="General Knowledge">General Knowledge</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Passed">Passed Only</option>
                <option value="Failed">Failed Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={submissions.length === 0}
                className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              {submissions.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all student records?')) {
                      onClearAllSubmissions();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Student Submissions Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {submissions.length === 0
                  ? 'No students have completed the exam yet. Switch to Student Portal to test take an exam.'
                  : 'No submissions matched your search query.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                        sub.isPassed
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {sub.percentage}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sub.studentName}</span>
                        <span className="text-xs text-slate-400 font-mono">({sub.rollNumber})</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            sub.isPassed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {sub.isPassed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>Subject: <strong className="text-slate-200">{sub.category}</strong></span>
                        <span>•</span>
                        <span>Score: <strong className="text-slate-200">{sub.score}/{sub.totalQuestions}</strong></span>
                        <span>•</span>
                        <span>Time: {Math.floor(sub.timeTakenSeconds / 60)}m {sub.timeTakenSeconds % 60}s</span>
                        <span>•</span>
                        <span>Date: {sub.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStudentSheet(sub)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Exam Sheet</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete record for ${sub.studentName}?`)) {
                          onDeleteSubmission(sub.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUESTION BANK MANAGEMENT */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuestion}
                  onChange={(e) => setSearchQuestion(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={questionCategoryFilter}
                onChange={(e) => setQuestionCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
              >
                <option value="All">All Categories ({questions.length})</option>
                <option value="Java">Java ({questions.filter((q) => q.category === 'Java').length})</option>
                <option value="Data Structures">Data Structures ({questions.filter((q) => q.category === 'Data Structures').length})</option>
                <option value="Python">Python ({questions.filter((q) => q.category === 'Python').length})</option>
                <option value="General Knowledge">General Knowledge ({questions.filter((q) => q.category === 'General Knowledge').length})</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Reset questions back to the default curated bank?')) {
                    onResetQuestions();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default Questions</span>
              </button>

              <button
                onClick={() => setActiveTab('add')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add New Question</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-400 font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs">
                      {q.category}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
                      title="Edit question"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h3>

                {q.codeSnippet && (
                  <pre className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-indigo-300 overflow-x-auto border border-slate-800">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                {/* Options grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctAnswerIndex;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-md border border-current flex items-center justify-center text-[10px]">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="truncate">{opt}</span>
                        {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-auto" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300">
                  <span className="font-bold text-indigo-400">Solution Explanation: </span>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADD NEW QUESTION */}
      {activeTab === 'add' && (
        <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>Prepare New Question & Solution</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add custom questions to Java, Data Structures, Python Basics, or General Knowledge.
            </p>
          </div>

          {formSuccessMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {formErrorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{formErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveNewQuestion} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                  Subject Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Java">Java</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Python">Python</option>
                  <option value="General Knowledge">General Knowledge</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                  Difficulty Level
                </label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Question Text *
              </label>
              <textarea
                rows={3}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="What is the concept or question to solve?"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                <span>Optional Code Snippet</span>
                <span className="text-[10px] text-slate-500 lowercase font-normal">(Leave blank if non-code)</span>
              </label>
              <textarea
                rows={3}
                value={newCodeSnippet}
                onChange={(e) => setNewCodeSnippet(e.target.value)}
                placeholder="public class Test { ... } or def func():"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-indigo-300 outline-none focus:border-indigo-500 resize-none text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-300 font-bold uppercase tracking-wider">
                Answer Options (A, B, C, D) *
              </label>
              {newOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...newOptions];
                      next[idx] = e.target.value;
                      setNewOptions(next);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 text-xs"
                  />
                  <input
                    type="radio"
                    name="correctOptionRadio"
                    checked={newCorrectIndex === idx}
                    onChange={() => setNewCorrectIndex(idx)}
                    className="w-4 h-4 text-indigo-600 focus:ring-0 cursor-pointer"
                    title="Mark as correct answer"
                  />
                </div>
              ))}
              <p className="text-[11px] text-slate-400">
                Tip: Click the radio button on the right to designate the correct answer (Currently: Option {String.fromCharCode(65 + newCorrectIndex)}).
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Detailed Solution & Explanation *
              </label>
              <textarea
                rows={3}
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Explain why this answer is correct and provide educational hints..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition text-sm flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Save Question to Bank</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: EXAM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Exam Rules & Timer Settings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters governing student test conditions.
            </p>
          </div>

          {settingsSaved && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Time Limit (Minutes) *
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Strict countdown timer. Student exam auto-submits once time reaches 00:00.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Passing Percentage (%) *
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Minimum percentage required for the student to achieve "Passed & Qualified" status.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Questions per Exam Session
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={questionsCount}
                onChange={(e) => setQuestionsCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                />
                <span className="font-semibold">Randomize Question Order for Each Student</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition text-sm flex items-center justify-center gap-2"
            >
              <span>Save Exam Configuration</span>
            </button>
          </form>
        </div>
      )}

      {/* STUDENT EXAM SHEET MODAL */}
      {selectedStudentSheet && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Student Exam Sheet: {selectedStudentSheet.studentName}
                </h3>
                <p className="text-xs text-slate-400">
                  Roll: {selectedStudentSheet.rollNumber} • Subject: {selectedStudentSheet.category} • Score: {selectedStudentSheet.score}/{selectedStudentSheet.totalQuestions} ({selectedStudentSheet.percentage}%)
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentSheet(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {selectedStudentSheet.answers.map((ans, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    ans.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : ans.userAnswerIndex === null
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">
                      Question {idx + 1} ({ans.category})
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                        ans.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : ans.userAnswerIndex === null
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {ans.isCorrect ? 'Correct (+1)' : ans.userAnswerIndex === null ? 'Unanswered (0)' : 'Incorrect (0)'}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-200 text-sm mb-3">{ans.questionText}</p>

                  <div className="space-y-1.5 mb-3">
                    {ans.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === ans.correctAnswerIndex;
                      const isStudentChoice = oIdx === ans.userAnswerIndex;

                      let cls = 'text-slate-400 bg-slate-900 border-slate-800';
                      if (isCorrect) {
                        cls = 'text-emerald-300 font-bold bg-emerald-500/10 border-emerald-500/30';
                      } else if (isStudentChoice && !ans.isCorrect) {
                        cls = 'text-rose-300 font-semibold line-through bg-rose-500/10 border-rose-500/30';
                      }

                      return (
                        <div key={oIdx} className={`p-2 rounded-xl border flex items-center justify-between ${cls}`}>
                          <span>• {String.fromCharCode(65 + oIdx)}: {opt}</span>
                          {isCorrect && <span className="text-[10px] text-emerald-400">✓ Correct Answer</span>}
                          {isStudentChoice && <span className="text-[10px] text-slate-300">(Student Chosen)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                    <strong className="text-indigo-400">Explanation: </strong>
                    {ans.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Edit Question</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuestion} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Subject</label>
                  <select
                    value={editingQuestion.category}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value as Category })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  >
                    <option value="Java">Java</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Python">Python</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Difficulty</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={2}
                  value={editingQuestion.codeSnippet || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, codeSnippet: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-indigo-300 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">Options</label>
                {editingQuestion.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 text-center font-bold text-slate-300 shrink-0 flex items-center justify-center">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...editingQuestion.options];
                        next[oIdx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: next });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                    />
                    <input
                      type="radio"
                      name="editCorrectRadio"
                      checked={editingQuestion.correctAnswerIndex === oIdx}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswerIndex: oIdx })}
                      className="w-4 h-4 text-indigo-600"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Solution Explanation</label>
                <textarea
                  rows={3}
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
