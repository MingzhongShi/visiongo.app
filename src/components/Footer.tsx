import { SiteLink } from './SiteLink';
import { useLanguage } from '../i18n/LanguageContext';
import { footerText } from '../i18n/text/Footer';

const icpRecord = import.meta.env.VITE_ICP_RECORD;

export function Footer(_props: { onNavigate: (path: string) => void; onOpenContact: () => void }) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const columns = [
    { title: footerText(zh).products, links: [['VisionStudio', '/products/visionstudio'], ['VisionRuntime', '/products/visionruntime'], ['VisionEdge', '/products/visionedge'], ['VisionCloud', '/products/visioncloud'], [footerText(zh).downloads, '/downloads']] },
    { title: footerText(zh).engineering, links: [[footerText(zh).quickstart, '/developers#quickstart'], [footerText(zh).sdkContracts, '/developers#sdk'], [footerText(zh).deploymentGuide, '/resources/local-deployment'], [footerText(zh).workflowDebugging, '/resources/workflow-debugging']] },
    { title: footerText(zh).teamAndSupport, links: [[footerText(zh).aboutVisiongo, '/about'], [footerText(zh).securityAndData, '/about#security'], [footerText(zh).contactEngineering, '/contact']] },
  ];
  return <footer className="border-t border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"><div className="site-container grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]"><div className="col-span-2 space-y-4 lg:col-span-1"><SiteLink href="/" className="text-lg font-semibold tracking-wider text-zinc-950 dark:text-white">VISIONGO</SiteLink><p className="max-w-xs text-sm leading-relaxed">{footerText(zh).anEngineeringWorkspace}</p><a href="mailto:contact@visiongo.app" className="block text-sm font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300">contact@visiongo.app</a></div>{columns.map(column => <div key={column.title}><h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-200">{column.title}</h2><ul className="space-y-3">{column.links.map(([label, href]) => <li key={href}><SiteLink href={href} className="text-sm hover:text-zinc-950 dark:hover:text-white">{label}</SiteLink></li>)}</ul></div>)}</div><div className="site-container"><div className="flex flex-wrap justify-between gap-4 border-t border-zinc-200 py-6 text-xs dark:border-zinc-800"><div className="flex flex-wrap gap-5"><span>© {new Date().getFullYear()} VISIONGO</span>{icpRecord && <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-zinc-950 dark:hover:text-white">{icpRecord}</a>}</div><div className="flex gap-5"><SiteLink href="/privacy" className="hover:text-zinc-950 dark:hover:text-white">{footerText(zh).privacyPolicy}</SiteLink><SiteLink href="/terms" className="hover:text-zinc-950 dark:hover:text-white">{footerText(zh).termsOfUse}</SiteLink></div></div></div></footer>;
}
