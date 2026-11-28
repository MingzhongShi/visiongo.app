import { SiteLink } from '../components/SiteLink';
import React from 'react';
import { Shield, Lock, Eye, Server, Mail } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { SeoHead } from '../components/SeoHead';
import { useLanguage } from '../i18n/LanguageContext';
import { privacyPolicyPageText } from '../i18n/text/PrivacyPolicyPage';

export const PrivacyPolicyPage: React.FC = () => {
  const { locale } = useLanguage();

  return (
    <div className="page-shell">
      <SeoHead
        title={privacyPolicyPageText(locale).privacyPolicyVisiongo}
        description={
          privacyPolicyPageText(locale).visiongoPrivacyPolicy
        }
        canonicalPath="/privacy"
      />

      <div className="max-w-4xl">
        <SectionHeader
          as="h1"
          badge={privacyPolicyPageText(locale).transparencyPrivacy}
          title={privacyPolicyPageText(locale).privacyPolicy}
          description={
            privacyPolicyPageText(locale).effectiveDateOctober
          }
        />

        <div className="max-w-none text-sm text-zinc-700 dark:text-zinc-300 space-y-10 leading-relaxed">
          {/* Section 1: Overview & Philosophy */}
          <div className="surface-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <Shield className="w-4 h-4" />
              <span>{privacyPolicyPageText(locale).corePrivacyPhilosophy}</span>
            </div>
            <p>
              {privacyPolicyPageText(locale).visiongoWeUs}
            </p>
          </div>

          {/* Section 2: Anonymous Downloads & Telemetry */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{privacyPolicyPageText(locale).softwareDownloadsAnonymous}</span>
            </h3>
            <p>
              {privacyPolicyPageText(locale).downloadingVisiongoSoftware}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong className="text-zinc-900 dark:text-zinc-200">{privacyPolicyPageText(locale).zeroRawIp}</strong>
                {privacyPolicyPageText(locale).toUnderstandAggregate}
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-zinc-200">{privacyPolicyPageText(locale).approximateGeolocation}</strong>
                {privacyPolicyPageText(locale).countryAndBroad}
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-zinc-200">{privacyPolicyPageText(locale).airGappedOperation}</strong>
                {privacyPolicyPageText(locale).visiongoRuntimeEngines}
              </li>
            </ul>
          </div>

          {/* Section 3: Google Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{privacyPolicyPageText(locale).googleAuthenticationAccount}</span>
            </h3>
            <p>
              {privacyPolicyPageText(locale).weProvideAn}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong className="text-zinc-900 dark:text-zinc-200">{privacyPolicyPageText(locale).minimumNecessaryScopes}</strong>
                {privacyPolicyPageText(locale).weRequestOnly}
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-zinc-200">{privacyPolicyPageText(locale).zeroPasswordAccess}</strong>
                {privacyPolicyPageText(locale).visiongoNeverReceives}
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-zinc-200">{privacyPolicyPageText(locale).dataStored}</strong>
                {privacyPolicyPageText(locale).weStoreOnly}
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-600/25 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5 p-6 space-y-2">
            <h3 className="text-base font-semibold text-emerald-800 dark:text-emerald-300">{privacyPolicyPageText(locale).aiDataTitle}</h3>
            <p className="text-zinc-700 dark:text-zinc-300">{privacyPolicyPageText(locale).aiDataDesc}</p>
          </div>
          {/* Section 4: Contact Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{privacyPolicyPageText(locale).contactInquiriesPilots}</span>
            </h3>
            <p>
              {privacyPolicyPageText(locale).whenSubmittingInquiries}
            </p>
          </div>

          {/* Section 5: Cookies */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{privacyPolicyPageText(locale).cookiesSessions}</span>
            </h3>
            <p>
              {privacyPolicyPageText(locale).weDoNot}
            </p>
            <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-400">
              <code>{privacyPolicyPageText(locale).cookieSummary}</code>
            </div>
          </div>

          {/* Section 6: Inquiries */}
          <div className="surface-card p-6 space-y-2">
            <h4 className="text-base font-bold text-zinc-950 dark:text-white">
              {privacyPolicyPageText(locale).userRightsContact}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {privacyPolicyPageText(locale).toRequestAccess}
            </p>
            <div className="pt-2 text-xs text-emerald-700 dark:text-emerald-400">
              <SiteLink href="mailto:contact@visiongo.app" className="hover:underline">
                contact@visiongo.app
              </SiteLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
