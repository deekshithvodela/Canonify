import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { LegalModalType } from './LegalModal';
import { StethoscopeLogo } from './StethoscopeLogo';

interface FooterProps {
  onOpenLegalModal: (type: LegalModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegalModal }) => {
  return (
    <footer className="bg-white dark:bg-[#161320] border-t border-[#e2dde8] dark:border-[#38314a] mt-12 py-6 text-xs text-slate-500 dark:text-slate-400" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright & Legal Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-center md:text-left">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <StethoscopeLogo size={18} className="text-[#4c3f6b] dark:text-[#a99ac7]" />
              <span>
                &copy; 2026{' '}
                <a
                  href="https://www.linkedin.com/in/deekshithvodela/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#4c3f6b] dark:hover:text-[#a99ac7] hover:underline underline-offset-2 transition-colors cursor-pointer"
                  aria-label="Deekshith Vodela LinkedIn profile (opens in new tab)"
                >
                  Deekshith Vodela
                </a>
              </span>
            </div>
            <span className="text-slate-400" aria-hidden="true">&bull;</span>
            <button
              onClick={() => onOpenLegalModal('license')}
              className="hover:text-[#4c3f6b] dark:hover:text-[#a99ac7] underline underline-offset-2 transition-colors cursor-pointer"
            >
              MIT License
            </button>
            <span className="text-slate-400" aria-hidden="true">&bull;</span>
            <button
              onClick={() => onOpenLegalModal('privacy')}
              className="hover:text-[#4c3f6b] dark:hover:text-[#a99ac7] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-400" aria-hidden="true">&bull;</span>
            <button
              onClick={() => onOpenLegalModal('disclosure')}
              className="hover:text-[#4c3f6b] dark:hover:text-[#a99ac7] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Disclosure
            </button>
            <span className="text-slate-400" aria-hidden="true">&bull;</span>
            <span className="text-slate-500 dark:text-slate-400">
              Data updated: October 2026
            </span>
          </div>

          {/* Action Buttons: Newsletter & Feedback */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://deekshithvodela.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to newsletter on Substack (opens in new tab)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2dde8] dark:border-[#38314a] hover:border-[#4c3f6b] dark:hover:border-[#8e7bb5] text-slate-700 dark:text-slate-300 hover:text-[#4c3f6b] dark:hover:text-[#a99ac7] bg-slate-50 dark:bg-[#201c2c] hover:bg-white dark:hover:bg-[#2b263b] transition-all text-[11px] font-medium"
            >
              <Mail className="w-3.5 h-3.5 text-[#4c3f6b] dark:text-[#a99ac7]" aria-hidden="true" />
              Subscribe to Newsletter
            </a>
            <a
              href="mailto:deekshithvodela@gmail.com?subject=Canonify%20Feedback"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2dde8] dark:border-[#38314a] hover:border-[#4c3f6b] dark:hover:border-[#8e7bb5] text-slate-700 dark:text-slate-300 hover:text-[#4c3f6b] dark:hover:text-[#a99ac7] bg-slate-50 dark:bg-[#201c2c] hover:bg-white dark:hover:bg-[#2b263b] transition-all text-[11px] font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#4c3f6b] dark:text-[#a99ac7]" aria-hidden="true" />
              Send Feedback
            </a>
          </div>
        </div>

        {/* Non-Official & Non-Impersonation Notice */}
        <div className="mt-4 pt-3 border-t border-[#e2dde8]/70 dark:border-[#38314a]/70 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 text-center md:text-left">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Non-Official Notice:</span>{' '}
          Canonify is an independent informational document archive and is NOT an official government or counselling website. We do not represent or impersonate the Medical Counselling Committee (MCC), DGHS, or any state admissions authority.
        </div>
      </div>
    </footer>
  );
};
