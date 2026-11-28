import { useRef } from 'react';
import { X } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { useDialogFocus } from './useDialogFocus';
import { useLanguage } from '../i18n/LanguageContext';
import { contactModalText } from '../i18n/text/ContactModal';

export function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { locale } = useLanguage();
  const dialog = useRef<HTMLDivElement>(null);
  useDialogFocus(isOpen, dialog, onClose);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 dark:bg-black/75 p-4 backdrop-blur-sm" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="contact-title" tabIndex={-1} className="relative max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4"><h2 id="contact-title" className="text-xl font-semibold text-zinc-950 dark:text-white">{contactModalText(locale).contactEngineering}</h2><button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white" aria-label={contactModalText(locale).close}><X className="h-5 w-5" /></button></div>
        <ContactForm />
      </div>
    </div>
  );
}
