import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-6xl mx-auto mt-10 p-5 bg-white dark:bg-[#1E1E1E] border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* Left: Branding & Developer Credit */}
      <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
        <div className="w-8 h-8 bg-neo-yellow border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
          ⚡
        </div>
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black uppercase tracking-wider text-black dark:text-white">
            <span>Developed & Managed by</span>
            <span className="px-2 py-0.5 bg-neo-yellow text-black border border-black shadow-[1px_1px_0px_#000]">
              Adnan Ahmad
            </span>
          </div>
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
            Designed for deliberate muscle memory acceleration to 70+ WPM
          </p>
        </div>
      </div>

      {/* Center/Right: Developer Social & Portfolio Links */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {/* LinkedIn Button */}
        <a
          href="https://www.linkedin.com/in/adnanrahmad"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0077B5] hover:bg-[#006097] text-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          title="Connect with Adnan Ahmad on LinkedIn"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.75-.79 1.75-1.76s-.78-1.75-1.75-1.75a1.75 1.75 0 0 0-1.76 1.75c0 .97.79 1.76 1.76 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
          </svg>
          <span>LinkedIn</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>

        {/* GitHub Button */}
        <a
          href="https://www.github.com/adnanaskh"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#24292F] hover:bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          title="View Adnan Ahmad's GitHub"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
          </svg>
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>

        {/* Portfolio Button */}
        <a
          href="https://adnanahmad.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neo-pink hover:bg-pink-600 text-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          title="Visit Adnan Ahmad's Portfolio (adnanahmad.tech)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Portfolio</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>

      {/* Right: Copyright info */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} TYPEBRUTAL
        </span>
      </div>
    </footer>
  );
};

