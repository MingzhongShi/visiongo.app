import { SiteLink } from '../components/SiteLink';
import React from 'react';
import { FileText, AlertTriangle, ShieldCheck, Scale, Cpu, Mail } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { SeoHead } from '../components/SeoHead';
import { useLanguage } from '../i18n/LanguageContext';
import { termsOfUsePageText } from '../i18n/text/TermsOfUsePage';

export const TermsOfUsePage: React.FC = () => {
  const { locale } = useLanguage();

  return (
    <div className="page-shell">
      <SeoHead
        title={termsOfUsePageText(locale).pageTitle}
        description={
          termsOfUsePageText(locale).termsOfUseGoverning
        }
        canonicalPath="/terms"
      />

      <div className="max-w-4xl">
        <SectionHeader
          as="h1"
          badge={termsOfUsePageText(locale).legalTerms}
          title={termsOfUsePageText(locale).heading}
          description={
            termsOfUsePageText(locale).effectiveDateOctober
          }
        />

        <div className="prose prose-invert max-w-none text-sm text-zinc-300 space-y-10 leading-relaxed">
          {/* Section 1: Acceptance */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>{termsOfUsePageText(locale).acceptanceOfTerms}</span>
            </h3>
            <p>
              {termsOfUsePageText(locale).welcomeToThe}
            </p>
          </div>

          {/* Section 2: CRITICAL SOFTWARE LICENSING CLAUSE */}
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {termsOfUsePageText(locale).importantNoticeSoftware}
              </span>
            </div>
            <p className="text-zinc-300">
              {termsOfUsePageText(locale).downloadingVisiongoSoftware}
            </p>
            <p className="text-zinc-400 text-xs">
              {termsOfUsePageText(locale).commercialProductionDeployment}
            </p>
          </div>

          {/* Section 3: Intellectual Property */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{termsOfUsePageText(locale).intellectualPropertyRights}</span>
            </h3>
            <p>
              {termsOfUsePageText(locale).allSoftwareBinaries}
            </p>
          </div>

          {/* Section 4: Acceptable Use */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>{termsOfUsePageText(locale).acceptableUseOf}</span>
            </h3>
            <p>
              {termsOfUsePageText(locale).youAgreeNot}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>{termsOfUsePageText(locale).launchingDosAttacks}</li>
              <li>{termsOfUsePageText(locale).tamperingWithApi}</li>
              <li>{termsOfUsePageText(locale).submittingSpamOr}</li>
            </ul>
          </div>

          {/* Section 5: Disclaimers & Limitation of Liability */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{termsOfUsePageText(locale).disclaimersLimitationOf}</span>
            </h3>
            <p className="text-zinc-400">
              {termsOfUsePageText(locale).thisWebsiteAnd}
            </p>
          </div>

          {/* Section 6: Contact */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>{termsOfUsePageText(locale).enterpriseLicensingLegal}</span>
            </h4>
            <p className="text-xs text-zinc-400">
              {termsOfUsePageText(locale).forCommercialProduction}
            </p>
            <div className="pt-2 text-xs text-emerald-400">
              <SiteLink href="mailto:sales@visiongo.app" className="hover:underline">
                sales@visiongo.app
              </SiteLink>{' '}
              <span className="text-zinc-600">|</span>{' '}
              <SiteLink href="mailto:contact@visiongo.app" className="hover:underline text-zinc-300">
                contact@visiongo.app
              </SiteLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
