import React, { useEffect } from 'react';
import { X, Shield, FileText, Info, Mail } from 'lucide-react';

export type LegalModalType = 'license' | 'privacy' | 'disclosure' | 'newsletter' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150" role="dialog" aria-modal="true">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#201c2c] text-slate-800 dark:text-slate-200 rounded-lg shadow-2xl border border-[#e2dde8] dark:border-[#38314a] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-100 dark:bg-[#161320] border-b border-[#e2dde8] dark:border-[#38314a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'license' && <FileText className="w-4 h-4 text-[#4c3f6b] dark:text-[#a99ac7]" aria-hidden="true" />}
            {type === 'privacy' && <Shield className="w-4 h-4 text-emerald-500" aria-hidden="true" />}
            {type === 'disclosure' && <Info className="w-4 h-4 text-[#4c3f6b] dark:text-[#a99ac7]" aria-hidden="true" />}
            {type === 'newsletter' && <Mail className="w-4 h-4 text-[#4c3f6b] dark:text-[#a99ac7]" aria-hidden="true" />}
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-brand-serif">
              {type === 'license' && 'MIT License'}
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'disclosure' && 'Official Sources & Legal Disclosure'}
              {type === 'newsletter' && 'Subscribe to Canonify Updates'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {type === 'license' && (
            <div className="space-y-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <p className="font-bold">MIT License</p>
                <p className="mt-1">Copyright (c) 2026 Deekshith Vodela</p>
                <p className="mt-3">
                  Permission is hereby granted, free of charge, to any person obtaining a copy
                  of this software and associated documentation files (the "Software"), to deal
                  in the Software without restriction, including without limitation the rights
                  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                  copies of the Software, and to permit persons to whom the Software is
                  furnished to do so, subject to the following conditions:
                </p>
                <p className="mt-3">
                  The above copyright notice and this permission notice shall be included in all
                  copies or substantial portions of the Software.
                </p>
                <p className="mt-3">
                  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                  SOFTWARE.
                </p>
              </div>

              <div className="font-sans text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Data &amp; Documents Ownership Note:</h4>
                <p>
                  The MIT license above applies exclusively to the software codebase, classification scripts, metadata parsers, and user interface developed for Canonify.
                  All admissions lists, seat matrices, allotment results, and institutional notifications hosted or indexed here remain public domain government publications issued by the Medical Counselling Committee (MCC) and respective State/UT Admissions Committees.
                </p>
              </div>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-3.5 text-slate-600 dark:text-slate-300">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">1. Privacy-First Architecture &amp; Zero Personal Tracking</h4>
                <p>
                  Canonify is an educational document archive designed with privacy at its core. We do not use commercial surveillance trackers (such as Google Analytics or Meta Pixel), fingerprinting libraries, or advertising cookies. To understand aggregate community visits, we use GoatCounter, an open-source, privacy-first, zero-cookie, GDPR-compliant analytics tool that counts page views without logging personal identities, candidate information, or IP addresses.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">2. Local Storage Usage</h4>
                <p>
                  We store only one key in your browser's <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">localStorage</code>:
                  <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] ml-1">canonify-theme</code> ("light" or "dark"). This strictly remembers your visual theme preference between page visits and is never transmitted to any server.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">3. Direct Document Downloads</h4>
                <p>
                  All document previewing and downloading actions occur directly between your web browser and the static hosting CDN. No search queries, document download logs, or candidate IP addresses are logged, harvested, or monetized.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">4. External Authority Links</h4>
                <p>
                  Canonify provides verified external links to official state admissions portals. When following an external link to an authority portal, you will be subject to the respective privacy policy and terms of that government website.
                </p>
              </div>
            </div>
          )}

          {type === 'disclosure' && (
            <div className="space-y-3.5 text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded text-rose-950 dark:text-rose-200">
                <p className="font-bold text-xs mb-1 uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  Non-Official &amp; Non-Impersonation Notice
                </p>
                <p className="leading-relaxed">
                  Canonify is strictly an independent, non-commercial informational document archive. <strong>Canonify is NOT an official government website, authority, or counselling body, and is NOT impersonating, representing, or acting on behalf of</strong> the Medical Counselling Committee (MCC), Directorate General of Health Services (DGHS), Ministry of Health &amp; Family Welfare (MoHFW), National Medical Commission (NMC), or any State/UT Medical Counselling &amp; Admissions Authority. We do not conduct counselling, allot seats, issue rank cards, collect admission fees, or process candidate registrations. All official counselling operations are conducted exclusively on respective official government portals.
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded text-amber-900 dark:text-amber-200">
                <p className="font-semibold mb-1">Directly Sourced Official Public Domain Data</p>
                <p>
                  All seat allotments, state rank merit lists, seat matrix PDFs, notifications, and information bulletins indexed or hosted on Canonify are public domain records downloaded directly from the official websites of the Medical Counselling Committee (MCC), Directorate General of Health Services (DGHS), and respective State/UT Admissions Committees across India.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">Independent Informational Archive</h4>
                <p>
                  Canonify is an independent non-commercial informational document archive. Canonify is not affiliated with, sponsored by, authorized by, or endorsed by the Medical Counselling Committee (MCC), the Ministry of Health &amp; Family Welfare (MoHFW), the National Testing Agency (NTA), the National Medical Commission (NMC), or any State Medical Admissions Committee.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">Candidate Guidance &amp; Official Verification</h4>
                <p>
                  While every file in this repository is preserved in its authentic, original state as downloaded from the official issuing authority, candidates and parents are strongly advised to always refer to their respective official state/MCC portals for active counselling schedules, reporting deadlines, fee deposit windows, and official grievance redressal.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">Absence of Commercial Predictions</h4>
                <p>
                  Canonify does not offer college rank predictions, paid counselling packages, seat probability estimations, or candidate consultation services.
                </p>
              </div>
            </div>
          )}

          {type === 'newsletter' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f0ecf6] dark:bg-[#2b253c] border border-[#e2dde8] dark:border-[#38314a] rounded-lg">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-brand-serif mb-1.5">
                  Canonify Newsletter on Substack
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  Subscribe directly on Substack to receive real-time notification briefings and analysis whenever new NEET UG counselling rounds, stray vacancy seat matrices, or state merit lists are published and archived.
                </p>
                <a
                  href="https://deekshithvodela.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-[#4c3f6b] hover:bg-[#5e4d84] text-white shadow-sm transition-all"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Open Substack Newsletter &rarr;</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#161320] border-t border-[#e2dde8] dark:border-[#38314a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-medium bg-[#322e45] hover:bg-[#4c3f6b] text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
