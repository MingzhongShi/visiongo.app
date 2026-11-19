import { SiteLink } from '../components/SiteLink';
import { ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { SectionHeader } from '../components/SectionHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { developersPageText } from '../i18n/text/DevelopersPage';

export function DevelopersPage(_props: { onNavigate?: (path: string) => void }) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const sections = [
    { id: 'quickstart', title: developersPageText(zh).quickstart, text: developersPageText(zh).choosePackagesFor, href: '/resources/getting-started' },
    { id: 'docs', title: developersPageText(zh).engineeringAndDeployment, text: developersPageText(zh).defineWorkstationExecution, href: '/resources/local-deployment' },
    { id: 'sdk', title: developersPageText(zh).publicSdkContracts, text: developersPageText(zh).theSdkIs, href: '/resources/sdk-contracts' },
    { id: 'api', title: developersPageText(zh).interfacesAndIntegration, text: developersPageText(zh).interfaceAvailabilityAnd, href: '/contact' },
    { id: 'examples', title: developersPageText(zh).workflowDebugging, text: developersPageText(zh).inspectNodeInputs, href: '/resources/workflow-debugging' },
  ];
  return <div className="page-shell"><SeoHead title={developersPageText(zh).developersGettingStarted} description={developersPageText(zh).downloadConnectAnd} canonicalPath="/developers" /><SectionHeader as="h1" badge="VISIONGO" title={developersPageText(zh).startWithYour} description={developersPageText(zh).installationAndWorkflow} /><nav aria-label={developersPageText(zh).developerGuides} className="mb-8 flex flex-wrap gap-3">{sections.map(section => <SiteLink className="btn-secondary" key={section.id} href={`#${section.id}`}>{section.title}</SiteLink>)}</nav><div className="mx-auto max-w-4xl space-y-6">{sections.map(section => <section key={section.id} id={section.id} className="surface-card p-6 sm:p-8"><h2 className="text-2xl font-semibold text-white">{section.title}</h2><p className="mt-4 leading-relaxed text-zinc-400">{section.text}</p><SiteLink className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-400" href={section.href}>{developersPageText(zh).learnMore}<ArrowRight className="h-4 w-4" /></SiteLink></section>)}</div></div>;
}
