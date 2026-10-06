import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  Download, 
  Smartphone, 
  Laptop, 
  Monitor,
  Archive
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'student' | 'admin';
  setCurrentTab: (tab: 'student' | 'admin') => void;
  onOpenResources: () => void;
  onOpenExport: () => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  isExamInProgress: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenResources,
  onOpenExport,
  isAdminLoggedIn,
  onAdminLogout,
  isExamInProgress,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">SmartExam</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Firebase: examportal-fd653</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-slate-400" /> Phone</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Laptop className="w-3 h-3 text-slate-400" /> Tablet & Laptop</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Monitor className="w-3 h-3 text-slate-400" /> Desktop</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isExamInProgress && (
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setCurrentTab('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'student'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
                {isAdminLoggedIn && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            </div>
          )}

          {/* Action Tools */}
          <button
            onClick={onOpenResources}
            title="Educational YouTube Channels"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Resources</span>
          </button>

          <button
            onClick={onOpenExport}
            title="Download ZIP Folder & Get HTML Code"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm active:scale-95"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ZIP Folder / HTML</span>
            <span className="sm:hidden">ZIP</span>
          </button>

          {currentTab === 'admin' && isAdminLoggedIn && (
            <button
              onClick={onAdminLogout}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
