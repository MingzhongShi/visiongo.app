import { SiteLink } from '../components/SiteLink';
import { ContactForm } from '../components/ContactForm';
import { SeoHead } from '../components/SeoHead';
import { SectionHeader } from '../components/SectionHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { contactPageText } from '../i18n/text/ContactPage';

export function ContactPage() {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  return <div className="page-shell">
    <SeoHead title={contactPageText(zh).contactEngineering} description={contactPageText(zh).discussVisiongoProducts} canonicalPath="/contact" />
    <SectionHeader as="h1" badge={contactPageText(zh).contactBadge} title={contactPageText(zh).tellUsAbout} description={contactPageText(zh).describeYourInspection} />
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <aside className="space-y-6 text-sm leading-relaxed text-zinc-400"><h2 className="text-xl font-semibold text-white">{contactPageText(zh).talkToEngineering}</h2><p>{contactPageText(zh).fromVisionstudioWorkflow}</p><div className="space-y-3">{['contact', 'sales', 'support'].map(name => <SiteLink key={name} href={`mailto:${name}@visiongo.app`} className="block text-emerald-400 hover:underline">{name}@visiongo.app</SiteLink>)}</div><p>{contactPageText(zh).ifTheForm}</p></aside>
      <div className="surface-card p-6 sm:p-8"><ContactForm /></div>
    </div>
  </div>;
}
