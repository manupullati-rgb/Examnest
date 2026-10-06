import React, { useState } from 'react';
import { Question, ExamConfig, ExamSubmission } from '../types/exam';
import { 
  generateStandaloneHtml, 
  downloadStandaloneHtmlFile, 
  downloadExamZipPackage 
} from '../utils/exportHelpers';
import { 
  X, 
  Download, 
  FileCode, 
  Archive, 
  Copy, 
  Check, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  submissions: ExamSubmission[];
  config: ExamConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  questions,
  submissions,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'view-code'>('download');
  const [isCopied, setIsCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtml(questions, config);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadExamZipPackage(questions, submissions, config);
    } catch (e) {
      console.error('Failed to create zip', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Export Standalone App & Source Code
              </h2>
              <p className="text-xs text-slate-400">
                Download single-file HTML or complete ZIP folder package
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5">
          <button
            onClick={() => setActiveTab('download')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'download'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Download Formats (Zip & HTML)</span>
          </button>
          <button
            onClick={() => setActiveTab('view-code')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'view-code'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Get HTML Code Only</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'download' && (
            <div className="space-y-4">
              {/* Option 1: ZIP Archive */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Download ZIP Folder Package</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      COMPLETE BUNDLE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Contains <code>index.html</code> (standalone responsive app), <code>questions_bank.json</code>, <code>student_submissions.json</code>, and <code>README.md</code> with full instructions.
                  </p>
                </div>

                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 shrink-0"
                >
                  <Archive className="w-4 h-4" />
                  <span>{isZipping ? 'Generating Zip...' : 'Download .zip Folder'}</span>
                </button>
              </div>

              {/* Option 2: Single-File HTML */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Download Standalone HTML File</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      SINGLE FILE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A 100% self-contained <code>.html</code> file with all questions, timer, solutions, and admin portal. Double click to run directly in any web browser!
                  </p>
                </div>

                <button
                  onClick={() => downloadStandaloneHtmlFile(questions, config)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .html File</span>
                </button>
              </div>

              {/* Compatibility & Credentials Information */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Pre-Configured Properties:</span>
                </div>
                <ul className="space-y-1 text-slate-400 pl-5 list-disc text-[11px]">
                  <li>
                    <strong className="text-slate-200">Device Responsiveness:</strong> Fully responsive on smart phones, tablets, laptops, and desktop computers.
                  </li>
                  <li>
                    <strong className="text-slate-200">Admin Login:</strong> Username <code className="text-indigo-400">sagar</code> | Password <code className="text-indigo-400">SAGAR!</code>
                  </li>
                  <li>
                    <strong className="text-slate-200">Timer:</strong> Strict {config.timeLimitMinutes}-minute countdown with auto-submission on timeout.
                  </li>
                  <li>
                    <strong className="text-slate-200">Resource Links:</strong> Included direct shortcuts to Jenny's lectures CS IT, Shradha Khapra, and Apna College.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'view-code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Complete Standalone HTML + CSS + JavaScript Exam Code:
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Entire HTML Code'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-200 max-h-[420px] overflow-auto leading-relaxed">
                  <code>{htmlCode}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Smartphone className="w-3.5 h-3.5" />
            <Laptop className="w-3.5 h-3.5" />
            <Monitor className="w-3.5 h-3.5" />
            <span>Runs locally on any device</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
