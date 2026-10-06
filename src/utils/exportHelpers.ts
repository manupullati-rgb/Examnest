import JSZip from 'jszip';
import { Question, ExamConfig, ExamSubmission } from '../types/exam';

export function generateStandaloneHtml(questions: Question[], config: ExamConfig): string {
  const safeQuestionsJson = JSON.stringify(questions).replace(/</g, '\\u003c');
  const safeConfigJson = JSON.stringify(config).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>SmartExam Pro - Standalone Examination App</title>
  <!-- Tailwind CSS CDN for instant styling on any device without internet install -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse-warning {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .timer-alert {
      animation: pulse-warning 1s infinite ease-in-out;
    }
    pre code {
      font-family: monospace;
    }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
  
  <!-- Navigation Header -->
  <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 py-3 shadow-md">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/30">
          SE
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">SmartExam Pro</h1>
          <p class="text-[11px] text-slate-400 hidden sm:block">Phones • Tablets • Laptops • Desktops</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button id="nav-resources-btn" onclick="openResourcesModal()" class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
          📚 Resources
        </button>
        <button id="nav-admin-btn" onclick="openAdminModal()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-600 text-white transition shadow">
          Admin (sagar)
        </button>
      </div>
    </div>
  </header>

  <!-- Main View Container -->
  <main class="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
    
    <!-- 1. LOGIN / START VIEW -->
    <div id="view-login" class="max-w-lg mx-auto w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur">
      <div class="text-center mb-6">
        <span class="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-medium mb-3">
          🎓 Student Examination Portal
        </span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Online Timed Exam</h2>
        <p class="text-sm text-slate-400 mt-1">Responsive on Smart Phones, Tablets & Desktops</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Full Student Name *</label>
          <input type="text" id="student-name" placeholder="e.g. Rahul Sharma" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm outline-none transition" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Roll Number / Student ID *</label>
          <input type="text" id="student-roll" placeholder="e.g. CS2026-042" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm outline-none transition" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Select Exam Subject</label>
          <select id="exam-category" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm outline-none transition">
            <option value="All">All Subjects (Java + DSA + Python + GK)</option>
            <option value="Java">Java Programming</option>
            <option value="Data Structures">Data Structures & Algorithms</option>
            <option value="Python">Python Basics</option>
            <option value="General Knowledge">General Knowledge & Tech</option>
          </select>
        </div>

        <div class="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-400 space-y-1.5">
          <div class="font-semibold text-slate-200">Exam Instructions & Rules:</div>
          <div>⏱️ <strong>Strict Timer:</strong> Exam duration is <span id="info-time-limit">10</span> minutes. Auto-submits on timeout!</div>
          <div>🎯 <strong>Marking:</strong> 1 mark per correct answer. Passing score: <span id="info-passing-percent">50</span>%.</div>
          <div>📱 <strong>Mobile friendly:</strong> Tap options to select, jump across questions anytime.</div>
        </div>

        <button onclick="startExam()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2">
          Start Examination Now →
        </button>
      </div>
    </div>

    <!-- 2. EXAM ROOM VIEW -->
    <div id="view-exam" class="hidden flex-1 flex flex-col gap-4">
      <!-- Top Exam Bar -->
      <div class="bg-slate-800/90 border border-slate-700 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div class="text-xs text-slate-400 font-medium" id="exam-student-label">Student: -</div>
          <div class="text-sm sm:text-base font-bold text-white" id="exam-subject-label">Subject: -</div>
        </div>
        
        <!-- Timer -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono font-bold" id="timer-box">
          <span class="text-slate-400 text-xs">TIME REMAINING:</span>
          <span id="timer-display" class="text-emerald-400 text-base">10:00</span>
        </div>

        <button onclick="confirmSubmitExam()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-lg transition shadow">
          Submit Exam
        </button>
      </div>

      <!-- Question Card & Navigation -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        <!-- Question Area -->
        <div class="lg:col-span-3 bg-slate-800/90 border border-slate-700 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <span id="question-badge" class="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
                Question 1 of 10
              </span>
              <span id="category-badge" class="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Java
              </span>
            </div>

            <h3 id="question-text" class="text-base sm:text-lg font-semibold text-white leading-relaxed mb-4">
              Question loading...
            </h3>

            <pre id="question-code" class="hidden bg-slate-950 text-indigo-300 p-3.5 rounded-lg text-xs font-mono mb-4 overflow-x-auto border border-slate-800"></pre>

            <div id="options-container" class="space-y-2.5 mb-6">
              <!-- Rendered options -->
            </div>
          </div>

          <!-- Bottom Navigation Controls -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-700">
            <div class="flex gap-2">
              <button onclick="navigateQuestion(-1)" id="btn-prev" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-white transition">
                ← Previous
              </button>
              <button onclick="navigateQuestion(1)" id="btn-next" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-white transition">
                Next →
              </button>
            </div>

            <div class="flex gap-2">
              <button onclick="clearCurrentResponse()" class="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition">
                Clear
              </button>
              <button onclick="toggleMarkForReview()" id="btn-review" class="px-3 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg text-xs font-medium transition">
                ⭐ Mark Review
              </button>
            </div>
          </div>
        </div>

        <!-- Question Palette / Overview (Mobile + Desktop) -->
        <div class="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex flex-col shadow-xl">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Questions Palette</h4>
          <div id="palette-grid" class="grid grid-cols-5 gap-2 max-h-56 lg:max-h-none overflow-y-auto pr-1">
            <!-- Palette buttons rendered here -->
          </div>

          <div class="mt-4 pt-3 border-t border-slate-700 text-[11px] text-slate-400 space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded bg-emerald-600 inline-block"></span> Answered
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded bg-amber-600 inline-block"></span> Marked for Review
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded bg-slate-700 inline-block"></span> Not Answered
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded ring-2 ring-indigo-400 bg-slate-800 inline-block"></span> Current
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. RESULT VIEW -->
    <div id="view-result" class="hidden max-w-2xl mx-auto w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur">
      <div class="text-center mb-6">
        <div id="result-status-badge" class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          PASSED
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white" id="result-student-name">Exam Completed</h2>
        <p class="text-xs sm:text-sm text-slate-400" id="result-meta">Roll: - | Subject: -</p>
      </div>

      <!-- Score Metrics Card -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-700/60 text-center">
          <div class="text-xs text-slate-400">Score</div>
          <div class="text-xl sm:text-2xl font-black text-indigo-400" id="result-score">0/0</div>
        </div>
        <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-700/60 text-center">
          <div class="text-xs text-slate-400">Percentage</div>
          <div class="text-xl sm:text-2xl font-black text-white" id="result-percentage">0%</div>
        </div>
        <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-700/60 text-center">
          <div class="text-xs text-slate-400">Correct / Wrong</div>
          <div class="text-sm sm:text-base font-bold text-emerald-400 mt-1" id="result-accuracy">0 / 0</div>
        </div>
        <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-700/60 text-center">
          <div class="text-xs text-slate-400">Time Taken</div>
          <div class="text-sm sm:text-base font-bold text-amber-400 mt-1" id="result-time">0m 0s</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <button onclick="toggleSolutionsModal()" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition text-center">
          📖 Check Question Solutions & Explanations
        </button>
        <button onclick="resetToLogin()" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-sm transition text-center">
          🔄 Retake / New Student
        </button>
      </div>

      <!-- Educational Recommendations -->
      <div class="bg-slate-900/80 rounded-xl p-4 border border-slate-700 text-xs text-slate-300">
        <div class="font-bold text-slate-200 mb-1">Recommended Learning Channels:</div>
        <p class="text-slate-400 mb-2">Sharpen your Java, Data Structures, and Python concepts on YouTube:</p>
        <div class="flex flex-wrap gap-2">
          <a href="https://www.youtube.com/@JennyslecturesCSIT" target="_blank" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700">Jenny's lectures CS IT ↗</a>
          <a href="https://www.youtube.com/@shradhaKD" target="_blank" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700">Shradha Khapra ↗</a>
          <a href="https://www.youtube.com/@ApnaCollegeOfficial" target="_blank" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700">Apna College ↗</a>
        </div>
      </div>
    </div>

  </main>

  <!-- MODALS -->

  <!-- 1. SOLUTIONS MODAL -->
  <div id="modal-solutions" class="hidden fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-bold text-lg text-white">Exam Questions & Solutions Review</h3>
        <button onclick="toggleSolutionsModal()" class="text-slate-400 hover:text-white text-lg">✕</button>
      </div>
      <div id="solutions-list" class="p-4 overflow-y-auto space-y-4 flex-1">
        <!-- Rendered solutions -->
      </div>
    </div>
  </div>

  <!-- 2. ADMIN MODAL (Username: sagar, Password: SAGAR!) -->
  <div id="modal-admin" class="hidden fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg text-white">Administrator Portal</h3>
          <p class="text-xs text-slate-400">Questions & Solutions Preparation | Results Checking</p>
        </div>
        <button onclick="closeAdminModal()" class="text-slate-400 hover:text-white text-lg">✕</button>
      </div>

      <!-- Admin Login Form (if not logged in) -->
      <div id="admin-login-box" class="p-6 max-w-sm mx-auto w-full text-center space-y-4 my-auto">
        <div class="w-12 h-12 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
          🔒
        </div>
        <h4 class="text-lg font-bold text-white">Admin Authentication</h4>
        <p class="text-xs text-slate-400">Username: <code class="text-indigo-300">sagar</code> | Password: <code class="text-indigo-300">SAGAR!</code></p>
        <div class="space-y-3 text-left">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <input type="text" id="admin-username" placeholder="sagar" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input type="password" id="admin-password" placeholder="SAGAR!" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none" />
          </div>
          <div id="admin-error" class="hidden text-xs text-rose-400 font-semibold">Invalid credentials.</div>
          <button onclick="handleAdminLogin()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition">
            Login as Admin
          </button>
        </div>
      </div>

      <!-- Admin Control Panel (when authenticated) -->
      <div id="admin-panel-box" class="hidden flex-1 flex flex-col overflow-hidden">
        <!-- Tabs -->
        <div class="flex border-b border-slate-800 bg-slate-950 px-4">
          <button onclick="switchAdminTab('results')" id="tab-btn-results" class="px-4 py-2.5 text-xs font-bold border-b-2 border-indigo-500 text-indigo-400">
            📊 Student Results
          </button>
          <button onclick="switchAdminTab('questions')" id="tab-btn-questions" class="px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-white">
            📝 Question Bank & Solutions
          </button>
          <button onclick="switchAdminTab('add-question')" id="tab-btn-add" class="px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-white">
            ➕ Add New Question
          </button>
          <button onclick="adminLogout()" class="ml-auto my-auto px-2 py-1 text-xs text-rose-400 hover:text-rose-300">
            Logout
          </button>
        </div>

        <!-- Tab 1: Results Checking -->
        <div id="admin-tab-results" class="p-4 overflow-y-auto flex-1 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400" id="results-count-label">0 student records</span>
            <button onclick="clearAllSubmissionsAdmin()" class="text-xs text-rose-400 hover:text-rose-300">Clear All Records</button>
          </div>
          <div id="admin-results-table" class="space-y-2">
            <!-- Rendered results -->
          </div>
        </div>

        <!-- Tab 2: Question Bank -->
        <div id="admin-tab-questions" class="hidden p-4 overflow-y-auto flex-1 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400" id="questions-count-label">0 questions available</span>
            <button onclick="resetQuestionsDefaultAdmin()" class="text-xs text-indigo-400 hover:text-indigo-300">Reset to Defaults</button>
          </div>
          <div id="admin-questions-list" class="space-y-2">
            <!-- Rendered questions -->
          </div>
        </div>

        <!-- Tab 3: Add Question Form -->
        <div id="admin-tab-add" class="hidden p-4 overflow-y-auto flex-1 space-y-3">
          <h4 class="font-bold text-white text-sm">Prepare Question & Solution</h4>
          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-300 mb-1">Subject / Category</label>
              <select id="new-q-cat" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white">
                <option value="Java">Java</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Python">Python</option>
                <option value="General Knowledge">General Knowledge</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-300 mb-1">Question Prompt *</label>
              <textarea id="new-q-text" rows="2" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" placeholder="Enter question..."></textarea>
            </div>
            <div>
              <label class="block text-slate-300 mb-1">Optional Code Snippet</label>
              <textarea id="new-q-code" rows="2" class="w-full p-2 rounded bg-slate-800 border border-slate-700 font-mono text-white" placeholder="Optional code..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-slate-300 mb-1">Option A</label>
                <input id="new-q-opt-0" type="text" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" placeholder="Option A" />
              </div>
              <div>
                <label class="block text-slate-300 mb-1">Option B</label>
                <input id="new-q-opt-1" type="text" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" placeholder="Option B" />
              </div>
              <div>
                <label class="block text-slate-300 mb-1">Option C</label>
                <input id="new-q-opt-2" type="text" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" placeholder="Option C" />
              </div>
              <div>
                <label class="block text-slate-300 mb-1">Option D</label>
                <input id="new-q-opt-3" type="text" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" placeholder="Option D" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-slate-300 mb-1">Correct Option (0=A, 1=B, 2=C, 3=D)</label>
                <select id="new-q-correct" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white">
                  <option value="0">Option A</option>
                  <option value="1">Option B</option>
                  <option value="2">Option C</option>
                  <option value="3">Option D</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-300 mb-1">Difficulty</label>
                <select id="new-q-diff" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-slate-300 mb-1">Detailed Explanation & Solution *</label>
              <textarea id="new-q-exp" rows="2" class="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" placeholder="Explain the concept and solution..."></textarea>
            </div>
            <button onclick="handleSaveNewQuestion()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition">
              Save Question to Exam Bank
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- 3. RESOURCES MODAL -->
  <div id="modal-resources" class="hidden fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <h3 class="font-bold text-lg text-white">Curated Learning Resources</h3>
        <button onclick="closeResourcesModal()" class="text-slate-400 hover:text-white text-lg">✕</button>
      </div>
      <p class="text-xs text-slate-400 mb-4">
        Master Java, Data Structures, Algorithms, and Python basics with top recommended educators:
      </p>
      <div class="space-y-3">
        <a href="https://www.youtube.com/@JennyslecturesCSIT" target="_blank" class="block p-3.5 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition">
          <div class="font-bold text-white text-sm">Jenny's lectures CS IT</div>
          <div class="text-xs text-indigo-400">youtube.com/@JennyslecturesCSIT ↗</div>
          <p class="text-[11px] text-slate-400 mt-1">In-depth explanations of Data Structures, Algorithms, Operating Systems, and C/Java.</p>
        </a>
        <a href="https://www.youtube.com/@shradhaKD" target="_blank" class="block p-3.5 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition">
          <div class="font-bold text-white text-sm">Shradha Khapra</div>
          <div class="text-xs text-indigo-400">youtube.com/@shradhaKD ↗</div>
          <p class="text-[11px] text-slate-400 mt-1">Foundational Java, Data Structures, placement interview series, and tech career guides.</p>
        </a>
        <a href="https://www.youtube.com/@ApnaCollegeOfficial" target="_blank" class="block p-3.5 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition">
          <div class="font-bold text-white text-sm">Apna College</div>
          <div class="text-xs text-indigo-400">youtube.com/@ApnaCollegeOfficial ↗</div>
          <p class="text-[11px] text-slate-400 mt-1">Complete DSA in Java/C++, Python complete bootcamps, and web development courses.</p>
        </a>
      </div>
    </div>
  </div>

  <!-- SCRIPT ENGINE -->
  <script>
    // State management
    const INITIAL_QUESTIONS = ${safeQuestionsJson};
    const EXAM_CONFIG = ${safeConfigJson};

    let questions = JSON.parse(localStorage.getItem('se_standalone_q')) || INITIAL_QUESTIONS;
    let submissions = JSON.parse(localStorage.getItem('se_standalone_sub')) || [];
    let currentExamQuestions = [];
    let currentStudent = null;
    let currentQuestionIndex = 0;
    let userAnswers = {}; // { questionId: { selected: number|null, marked: bool } }
    let timerInterval = null;
    let timeRemaining = 0;
    let totalExamSeconds = 0;
    let lastExamResult = null;
    let isAdminLoggedIn = false;

    // Timer format
    function formatTime(secs) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    // Start Exam
    function startExam() {
      const name = document.getElementById('student-name').value.trim();
      const roll = document.getElementById('student-roll').value.trim();
      const cat = document.getElementById('exam-category').value;

      if (!name || !roll) {
        alert('Please enter your full student name and roll number.');
        return;
      }

      currentStudent = { name, roll, category: cat };
      
      // Filter questions
      let filtered = cat === 'All' ? [...questions] : questions.filter(q => q.category === cat);
      if (filtered.length === 0) {
        filtered = [...questions];
      }

      // Shuffle
      filtered.sort(() => Math.random() - 0.5);
      const limit = Math.min(filtered.length, EXAM_CONFIG.questionsPerExam || 10);
      currentExamQuestions = filtered.slice(0, limit);

      userAnswers = {};
      currentExamQuestions.forEach(q => {
        userAnswers[q.id] = { selected: null, marked: false };
      });

      currentQuestionIndex = 0;
      totalExamSeconds = (EXAM_CONFIG.timeLimitMinutes || 10) * 60;
      timeRemaining = totalExamSeconds;

      document.getElementById('exam-student-label').innerText = 'Student: ' + name + ' (' + roll + ')';
      document.getElementById('exam-subject-label').innerText = 'Subject: ' + (cat === 'All' ? 'Comprehensive (Java, DSA, Python, GK)' : cat);

      document.getElementById('view-login').classList.add('hidden');
      document.getElementById('view-result').classList.add('hidden');
      document.getElementById('view-exam').classList.remove('hidden');

      renderQuestion();
      renderPalette();
      startTimer();
    }

    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      const timerDisplay = document.getElementById('timer-display');
      const timerBox = document.getElementById('timer-box');

      timerDisplay.innerText = formatTime(timeRemaining);

      timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.innerText = formatTime(timeRemaining);

        if (timeRemaining <= 120) {
          timerBox.classList.add('timer-alert', 'border-rose-500', 'bg-rose-950/40');
          timerDisplay.classList.remove('text-emerald-400');
          timerDisplay.classList.add('text-rose-400');
        }

        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          alert('Time is up! Your exam will be submitted automatically.');
          submitExam();
        }
      }, 1000);
    }

    function renderQuestion() {
      const q = currentExamQuestions[currentQuestionIndex];
      document.getElementById('question-badge').innerText = 'Question ' + (currentQuestionIndex + 1) + ' of ' + currentExamQuestions.length;
      document.getElementById('category-badge').innerText = q.category + ' • ' + q.difficulty;
      document.getElementById('question-text').innerText = q.question;

      const codeBox = document.getElementById('question-code');
      if (q.codeSnippet) {
        codeBox.innerText = q.codeSnippet;
        codeBox.classList.remove('hidden');
      } else {
        codeBox.classList.add('hidden');
      }

      const container = document.getElementById('options-container');
      container.innerHTML = '';

      const currentSelected = userAnswers[q.id].selected;

      q.options.forEach((opt, idx) => {
        const isSel = currentSelected === idx;
        const btn = document.createElement('div');
        btn.className = 'p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ' +
          (isSel ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold' : 'bg-slate-900 border-slate-700/80 hover:border-slate-500 text-slate-300');
        
        btn.innerHTML = '<span class="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ' +
          (isSel ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600 text-slate-400') + '">' +
          String.fromCharCode(65 + idx) + '</span>' +
          '<span>' + opt + '</span>';

        btn.onclick = () => selectOption(idx);
        container.appendChild(btn);
      });

      const isMarked = userAnswers[q.id].marked;
      const reviewBtn = document.getElementById('btn-review');
      if (isMarked) {
        reviewBtn.innerText = '★ Flagged for Review';
        reviewBtn.className = 'px-3 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition';
      } else {
        reviewBtn.innerText = '⭐ Mark Review';
        reviewBtn.className = 'px-3 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg text-xs font-medium transition';
      }

      document.getElementById('btn-prev').disabled = currentQuestionIndex === 0;
      document.getElementById('btn-prev').style.opacity = currentQuestionIndex === 0 ? '0.5' : '1';
      document.getElementById('btn-next').disabled = currentQuestionIndex === currentExamQuestions.length - 1;
      document.getElementById('btn-next').style.opacity = currentQuestionIndex === currentExamQuestions.length - 1 ? '0.5' : '1';
    }

    function selectOption(idx) {
      const q = currentExamQuestions[currentQuestionIndex];
      userAnswers[q.id].selected = idx;
      renderQuestion();
      renderPalette();
    }

    function clearCurrentResponse() {
      const q = currentExamQuestions[currentQuestionIndex];
      userAnswers[q.id].selected = null;
      renderQuestion();
      renderPalette();
    }

    function toggleMarkForReview() {
      const q = currentExamQuestions[currentQuestionIndex];
      userAnswers[q.id].marked = !userAnswers[q.id].marked;
      renderQuestion();
      renderPalette();
    }

    function navigateQuestion(offset) {
      const next = currentQuestionIndex + offset;
      if (next >= 0 && next < currentExamQuestions.length) {
        currentQuestionIndex = next;
        renderQuestion();
        renderPalette();
      }
    }

    function jumpToQuestion(idx) {
      currentQuestionIndex = idx;
      renderQuestion();
      renderPalette();
    }

    function renderPalette() {
      const grid = document.getElementById('palette-grid');
      grid.innerHTML = '';

      currentExamQuestions.forEach((q, idx) => {
        const state = userAnswers[q.id];
        const isCurrent = idx === currentQuestionIndex;
        let colorClass = 'bg-slate-700 text-slate-300';

        if (state.marked) {
          colorClass = 'bg-amber-600 text-white font-bold';
        } else if (state.selected !== null) {
          colorClass = 'bg-emerald-600 text-white font-bold';
        }

        const ring = isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-105' : '';

        const btn = document.createElement('button');
        btn.className = 'h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition ' + colorClass + ' ' + ring;
        btn.innerText = idx + 1;
        btn.onclick = () => jumpToQuestion(idx);
        grid.appendChild(btn);
      });
    }

    function confirmSubmitExam() {
      let answeredCount = 0;
      Object.values(userAnswers).forEach(a => {
        if (a.selected !== null) answeredCount++;
      });
      const unanswered = currentExamQuestions.length - answeredCount;
      const msg = unanswered > 0
        ? 'You have ' + unanswered + ' unanswered questions out of ' + currentExamQuestions.length + '. Are you sure you want to finish and submit?'
        : 'Are you sure you want to submit your exam now?';

      if (confirm(msg)) {
        submitExam();
      }
    }

    function submitExam() {
      if (timerInterval) clearInterval(timerInterval);

      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      const answerRecords = currentExamQuestions.map(q => {
        const userChoice = userAnswers[q.id].selected;
        const isCorrect = userChoice === q.correctAnswerIndex;

        if (userChoice === null) {
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
          userAnswerIndex: userChoice,
          correctAnswerIndex: q.correctAnswerIndex,
          isCorrect: isCorrect,
          explanation: q.explanation
        };
      });

      const total = currentExamQuestions.length;
      const score = correctCount;
      const percentage = Math.round((correctCount / total) * 100);
      const isPassed = percentage >= (EXAM_CONFIG.passingPercentage || 50);
      const timeTaken = totalExamSeconds - Math.max(0, timeRemaining);

      const submission = {
        id: 'sub_' + Date.now(),
        studentName: currentStudent.name,
        rollNumber: currentStudent.roll,
        category: currentStudent.category,
        totalQuestions: total,
        attempted: total - unansweredCount,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        score: score,
        percentage: percentage,
        isPassed: isPassed,
        timeTakenSeconds: timeTaken,
        submittedAt: new Date().toLocaleString(),
        answers: answerRecords
      };

      submissions.unshift(submission);
      localStorage.setItem('se_standalone_sub', JSON.stringify(submissions));
      lastExamResult = submission;

      // Show Result View
      document.getElementById('view-exam').classList.add('hidden');
      document.getElementById('view-result').classList.remove('hidden');

      const badge = document.getElementById('result-status-badge');
      if (isPassed) {
        badge.innerText = 'EXAM PASSED (QUALIFIED)';
        badge.className = 'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      } else {
        badge.innerText = 'NEEDS IMPROVEMENT';
        badge.className = 'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 bg-rose-500/20 text-rose-400 border border-rose-500/30';
      }

      document.getElementById('result-student-name').innerText = currentStudent.name;
      document.getElementById('result-meta').innerText = 'Roll No: ' + currentStudent.roll + ' | Subject: ' + currentStudent.category;
      document.getElementById('result-score').innerText = score + ' / ' + total;
      document.getElementById('result-percentage').innerText = percentage + '%';
      document.getElementById('result-accuracy').innerText = correctCount + ' correct • ' + wrongCount + ' wrong';
      document.getElementById('result-time').innerText = formatTime(timeTaken);
    }

    function toggleSolutionsModal() {
      const modal = document.getElementById('modal-solutions');
      if (modal.classList.contains('hidden')) {
        renderSolutionsList();
        modal.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
      }
    }

    function renderSolutionsList() {
      if (!lastExamResult) return;
      const list = document.getElementById('solutions-list');
      list.innerHTML = '';

      lastExamResult.answers.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'p-4 rounded-xl border text-xs ' +
          (item.isCorrect ? 'bg-emerald-950/20 border-emerald-800/50' : item.userAnswerIndex === null ? 'bg-slate-800/40 border-slate-700' : 'bg-rose-950/20 border-rose-800/50');

        let statusText = item.isCorrect ? '✅ Correct' : item.userAnswerIndex === null ? '⚪ Unanswered' : '❌ Incorrect';

        let optionsHtml = item.options.map((opt, oIdx) => {
          let optClass = 'text-slate-300';
          if (oIdx === item.correctAnswerIndex) {
            optClass = 'text-emerald-400 font-bold';
          } else if (oIdx === item.userAnswerIndex && !item.isCorrect) {
            optClass = 'text-rose-400 line-through';
          }
          return '<div class="' + optClass + '">• ' + String.fromCharCode(65 + oIdx) + ': ' + opt + '</div>';
        }).join('');

        div.innerHTML = '<div class="flex items-center justify-between mb-2">' +
          '<span class="font-bold text-slate-200">Question ' + (idx + 1) + ' (' + item.category + ')</span>' +
          '<span class="font-bold">' + statusText + '</span>' +
          '</div>' +
          '<p class="text-sm font-semibold text-white mb-2">' + item.questionText + '</p>' +
          '<div class="space-y-1 my-2 bg-slate-950/50 p-2.5 rounded-lg">' + optionsHtml + '</div>' +
          '<div class="mt-2 pt-2 border-t border-slate-800 text-slate-300 leading-relaxed">' +
          '<strong class="text-indigo-400">Solution & Explanation: </strong>' + item.explanation +
          '</div>';

        list.appendChild(div);
      });
    }

    function resetToLogin() {
      document.getElementById('view-result').classList.add('hidden');
      document.getElementById('view-exam').classList.add('hidden');
      document.getElementById('view-login').classList.remove('hidden');
    }

    // Modal controls
    function openResourcesModal() { document.getElementById('modal-resources').classList.remove('hidden'); }
    function closeResourcesModal() { document.getElementById('modal-resources').classList.add('hidden'); }

    function openAdminModal() {
      document.getElementById('modal-admin').classList.remove('hidden');
      if (isAdminLoggedIn) {
        showAdminPanel();
      } else {
        document.getElementById('admin-login-box').classList.remove('hidden');
        document.getElementById('admin-panel-box').classList.add('hidden');
      }
    }
    function closeAdminModal() { document.getElementById('modal-admin').classList.add('hidden'); }

    // Admin Auth
    function handleAdminLogin() {
      const u = document.getElementById('admin-username').value.trim();
      const p = document.getElementById('admin-password').value.trim();
      if (u === 'sagar' && p === 'SAGAR!') {
        isAdminLoggedIn = true;
        document.getElementById('admin-error').classList.add('hidden');
        showAdminPanel();
      } else {
        document.getElementById('admin-error').classList.remove('hidden');
      }
    }

    function adminLogout() {
      isAdminLoggedIn = false;
      document.getElementById('admin-login-box').classList.remove('hidden');
      document.getElementById('admin-panel-box').classList.add('hidden');
    }

    function showAdminPanel() {
      document.getElementById('admin-login-box').classList.add('hidden');
      document.getElementById('admin-panel-box').classList.remove('hidden');
      switchAdminTab('results');
    }

    function switchAdminTab(tab) {
      ['results', 'questions', 'add'].forEach(t => {
        const btn = document.getElementById('tab-btn-' + (t === 'add' ? 'add' : t));
        const view = document.getElementById('admin-tab-' + t);
        if (t === tab || (t === 'add' && tab === 'add-question')) {
          if (btn) {
            btn.className = 'px-4 py-2.5 text-xs font-bold border-b-2 border-indigo-500 text-indigo-400';
          }
          if (view) view.classList.remove('hidden');
        } else {
          if (btn) {
            btn.className = 'px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-white';
          }
          if (view) view.classList.add('hidden');
        }
      });

      if (tab === 'results') renderAdminResults();
      if (tab === 'questions') renderAdminQuestions();
    }

    function renderAdminResults() {
      const table = document.getElementById('admin-results-table');
      document.getElementById('results-count-label').innerText = submissions.length + ' student records recorded';
      table.innerHTML = '';

      if (submissions.length === 0) {
        table.innerHTML = '<div class="text-center py-8 text-slate-500 text-xs">No exam submissions recorded yet.</div>';
        return;
      }

      submissions.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs';
        card.innerHTML = '<div>' +
          '<div class="font-bold text-white text-sm">' + sub.studentName + ' <span class="text-slate-400 text-xs">(' + sub.rollNumber + ')</span></div>' +
          '<div class="text-slate-400 text-[11px]">' + sub.category + ' • Submitted: ' + sub.submittedAt + ' • Time: ' + formatTime(sub.timeTakenSeconds) + '</div>' +
          '</div>' +
          '<div class="flex items-center gap-3">' +
          '<div class="text-right">' +
          '<div class="font-bold ' + (sub.isPassed ? 'text-emerald-400' : 'text-rose-400') + '">' + sub.score + '/' + sub.totalQuestions + ' (' + sub.percentage + '%)</div>' +
          '<div class="text-[10px] uppercase font-semibold text-slate-400">' + (sub.isPassed ? 'Passed' : 'Failed') + '</div>' +
          '</div>' +
          '</div>';
        table.appendChild(card);
      });
    }

    function clearAllSubmissionsAdmin() {
      if (confirm('Clear all student results?')) {
        submissions = [];
        localStorage.removeItem('se_standalone_sub');
        renderAdminResults();
      }
    }

    function renderAdminQuestions() {
      const list = document.getElementById('admin-questions-list');
      document.getElementById('questions-count-label').innerText = questions.length + ' questions prepared';
      list.innerHTML = '';

      questions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1';
        item.innerHTML = '<div class="flex items-center justify-between">' +
          '<span class="font-bold text-indigo-400">' + (idx + 1) + '. ' + q.category + ' (' + q.difficulty + ')</span>' +
          '<button onclick="deleteQuestionAdmin(' + idx + ')" class="text-rose-400 hover:text-rose-300 text-[11px]">Delete</button>' +
          '</div>' +
          '<div class="font-semibold text-white">' + q.question + '</div>' +
          '<div class="text-emerald-400 font-medium">✓ Correct Answer: Option ' + String.fromCharCode(65 + q.correctAnswerIndex) + ' - ' + q.options[q.correctAnswerIndex] + '</div>' +
          '<div class="text-slate-400 text-[11px]">Solution: ' + q.explanation + '</div>';
        list.appendChild(item);
      });
    }

    function deleteQuestionAdmin(idx) {
      if (confirm('Delete this question?')) {
        questions.splice(idx, 1);
        localStorage.setItem('se_standalone_q', JSON.stringify(questions));
        renderAdminQuestions();
      }
    }

    function resetQuestionsDefaultAdmin() {
      if (confirm('Reset question bank back to default Java, DSA, Python, and GK questions?')) {
        questions = [...INITIAL_QUESTIONS];
        localStorage.setItem('se_standalone_q', JSON.stringify(questions));
        renderAdminQuestions();
      }
    }

    function handleSaveNewQuestion() {
      const cat = document.getElementById('new-q-cat').value;
      const text = document.getElementById('new-q-text').value.trim();
      const code = document.getElementById('new-q-code').value.trim();
      const optA = document.getElementById('new-q-opt-0').value.trim();
      const optB = document.getElementById('new-q-opt-1').value.trim();
      const optC = document.getElementById('new-q-opt-2').value.trim();
      const optD = document.getElementById('new-q-opt-3').value.trim();
      const correct = parseInt(document.getElementById('new-q-correct').value, 10);
      const diff = document.getElementById('new-q-diff').value;
      const exp = document.getElementById('new-q-exp').value.trim();

      if (!text || !optA || !optB || !optC || !optD || !exp) {
        alert('Please fill out question prompt, all 4 options, and explanation.');
        return;
      }

      const newQ = {
        id: 'q_' + Date.now(),
        category: cat,
        question: text,
        codeSnippet: code || undefined,
        options: [optA, optB, optC, optD],
        correctAnswerIndex: correct,
        explanation: exp,
        difficulty: diff
      };

      questions.unshift(newQ);
      localStorage.setItem('se_standalone_q', JSON.stringify(questions));

      alert('Question saved successfully!');
      document.getElementById('new-q-text').value = '';
      document.getElementById('new-q-code').value = '';
      document.getElementById('new-q-opt-0').value = '';
      document.getElementById('new-q-opt-1').value = '';
      document.getElementById('new-q-opt-2').value = '';
      document.getElementById('new-q-opt-3').value = '';
      document.getElementById('new-q-exp').value = '';

      switchAdminTab('questions');
    }
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile(questions: Question[], config: ExamConfig): void {
  const htmlContent = generateStandaloneHtml(questions, config);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smartexam-standalone-portal.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadExamZipPackage(
  questions: Question[],
  submissions: ExamSubmission[],
  config: ExamConfig
): Promise<void> {
  const zip = new JSZip();

  // 1. Full self-contained single-file HTML app
  const htmlCode = generateStandaloneHtml(questions, config);
  zip.file('index.html', htmlCode);

  // 2. Firebase Configuration & Rules
  const firebaseConfigData = {
    apiKey: "AIzaSyCvAaWlk7-SESGtoMHp3tMp37eyEpg33KM",
    authDomain: "examportal-fd653.firebaseapp.com",
    projectId: "examportal-fd653",
    storageBucket: "examportal-fd653.firebasestorage.app",
    messagingSenderId: "591541516302",
    appId: "1:591541516302:web:c39f121beef2fdcb87645f",
    measurementId: "G-NF5KX0XS2K"
  };
  zip.file('firebase_config.json', JSON.stringify(firebaseConfigData, null, 2));

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /questions/{questionId} {
      allow read, write: if true;
    }
    match /submissions/{submissionId} {
      allow read, write: if true;
    }
    match /config/{configId} {
      allow read, write: if true;
    }
  }
}`;
  zip.file('firestore.rules', firestoreRules);

  // 3. Question Bank JSON
  zip.file('questions_bank.json', JSON.stringify(questions, null, 2));

  // 4. Submissions data JSON
  zip.file('student_submissions.json', JSON.stringify(submissions, null, 2));

  // 4. Admin credentials & rules documentation
  const credentialsReadme = `# SmartExam Pro - Examination Portal Package

## 🔐 Admin Credentials
- **Username:** \`sagar\`
- **Password:** \`SAGAR!\`

## 📱 Device Compatibility
Designed and optimized for:
- Smart Phones (iOS Safari, Android Chrome)
- Tablets & iPads
- Laptops
- Desktops & Workstations

## 📚 Subject Coverage
1. **Java Programming** (OOP, Memory, Collections, Concurrency)
2. **Data Structures & Algorithms** (Trees, Stacks, Queues, Linked Lists, Graphs)
3. **Python Basics** (Data types, Comprehensions, Slicing, Functions)
4. **General Knowledge & Tech** (Computer Architecture, Computing Pioneers, Tech Milestones)

## 🎥 Recommended Learning Video Resources
- **Jenny's lectures CS IT**: https://www.youtube.com/@JennyslecturesCSIT
- **Shradha Khapra**: https://www.youtube.com/@shradhaKD
- **Apna College**: https://www.youtube.com/@ApnaCollegeOfficial

## 🚀 How to Run
1. Simply double-click \`index.html\` to open in any web browser!
2. No internet server required to run.
3. Questions and student results persist automatically in the browser storage.
`;
  zip.file('README.md', credentialsReadme);

  // Generate zip blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smartexam-pro-package.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
