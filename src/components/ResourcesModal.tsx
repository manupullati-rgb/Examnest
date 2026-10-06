import React from 'react';
import { X, ExternalLink, Youtube, BookOpen, Sparkles, CheckCircle } from 'lucide-react';

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const channels = [
    {
      name: "Jenny's lectures CS IT",
      handle: "@JennyslecturesCSIT",
      url: "https://www.youtube.com/@JennyslecturesCSIT",
      tag: "Data Structures & Core CS",
      description: "Comprehensive in-depth engineering courses on Data Structures, Algorithms, Operating Systems, C, and Java.",
      topics: ["Trees & Graphs", "Stacks & Queues", "Sorting Algorithms", "Time & Space Complexity"],
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    },
    {
      name: "Shradha Khapra",
      handle: "@shradhaKD",
      url: "https://www.youtube.com/@shradhaKD",
      tag: "Java & DSA Placement Series",
      description: "Crystal-clear tutorials for Java programming from scratch, DSA placement series, interview preparation, and tech roadmaps.",
      topics: ["Java OOP Concepts", "Recursion & Backtracking", "Binary Search", "Interview Problem Solving"],
      color: "from-sky-500/20 to-indigo-500/10 border-sky-500/30",
    },
    {
      name: "Apna College",
      handle: "@ApnaCollegeOfficial",
      url: "https://www.youtube.com/@ApnaCollegeOfficial",
      tag: "Complete Coding Bootcamps",
      description: "Complete DSA courses in Java/C++, Python complete beginner-to-advanced series, and web development fundamentals.",
      topics: ["Python 1-Shot Lectures", "Complete Java Alpha", "DSA Practice Sheets", "Web Dev & Projects"],
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-500/30 text-red-400 flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Recommended Learning Resources</h2>
              <p className="text-xs text-slate-400">Master syllabus concepts with top computer science educators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <span>
              All exam topics—Java, Data Structures, Python Basics, and Computer Architecture—are thoroughly explained in these official YouTube channels.
            </span>
          </div>

          <div className="space-y-4">
            {channels.map((ch, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-gradient-to-br ${ch.color} border transition group`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white mb-1.5">
                      {ch.tag}
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>{ch.name}</span>
                      <span className="text-xs text-slate-400 font-mono font-normal">({ch.handle})</span>
                    </h3>
                  </div>

                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                  >
                    <span>Visit Channel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {ch.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {ch.topics.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
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
