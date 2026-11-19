import { SiteLink } from '../components/SiteLink';
import React from 'react';
import { Mail, Shield, Terminal, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { SeoHead } from '../components/SeoHead';
import { useLanguage } from '../i18n/LanguageContext';
import { aboutPageText } from '../i18n/text/AboutPage';

interface AboutPageProps {
  onOpenContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenContact }) => {
  const { locale } = useLanguage();

  return (
    <div className="page-shell">
      <SeoHead
        title={aboutPageText(locale).title}
        description={aboutPageText(locale).description}
        canonicalPath="/about"
      />

      <div>
        <SectionHeader
          as="h1"
          badge={aboutPageText(locale).badge}
          title={aboutPageText(locale).title}
          description={aboutPageText(locale).description}
        />

        {/* Core Mission Statement Box */}
        <div className="surface-card tech-grid mb-16 space-y-5 p-8 sm:p-12">
          <div className="eyebrow">
            {aboutPageText(locale).brandBadge}
          </div>
          <h2 className="section-title max-w-3xl">
            {aboutPageText(locale).brandHeadline}
          </h2>
          <p className="lead max-w-3xl">
            {aboutPageText(locale).brandParagraph}
          </p>
        </div>

        {/* Engineering Principles */}
        <div className="mb-20">
          <h3 className="section-title mb-8">
            {aboutPageText(locale).principlesHeader}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="surface-card space-y-3 p-7">
              <div className="icon-tile">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">{aboutPageText(locale).principle1Title}</h4>
              <p className="text-sm leading-relaxed text-zinc-400">
                {aboutPageText(locale).principle1Desc}
              </p>
            </div>

            <div className="surface-card space-y-3 p-7">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">{aboutPageText(locale).principle2Title}</h4>
              <p className="text-sm leading-relaxed text-zinc-400">
                {aboutPageText(locale).principle2Desc}
              </p>
            </div>

            <div className="surface-card space-y-3 p-7">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">{aboutPageText(locale).principle3Title}</h4>
              <p className="text-sm leading-relaxed text-zinc-400">
                {aboutPageText(locale).principle3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Global Contacts & Enterprise Pilot */}
        <div className="surface-card flex flex-col justify-between gap-8 p-8 sm:p-10 md:flex-row md:items-center">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">{aboutPageText(locale).contactTitle}</h3>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              {aboutPageText(locale).contactDesc}
            </p>
            <div className="pt-2 flex flex-col gap-1 text-xs text-zinc-400">
              <span className="text-zinc-300">Websites: https://visiongo.app (International) · https://visiongo.com.cn (China)</span>
              <span>General: contact@visiongo.app</span>
              <span>Enterprise & Licensing: sales@visiongo.app</span>
              <span>Technical Support: support@visiongo.app</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenContact}
              className="btn-primary"
            >
              <span>{aboutPageText(locale).scheduleCall}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <SiteLink
              href="mailto:contact@visiongo.app"
              className="btn-secondary"
            >
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>{aboutPageText(locale).emailEngineering}</span>
            </SiteLink>
          </div>
        </div>
      </div>
    </div>
  );
};
