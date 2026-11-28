import { SiteLink } from '../components/SiteLink';
import { ArrowRight, Code2, Cpu, FileCode2, PlayCircle, ShieldCheck, Terminal } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { SectionHeader } from '../components/SectionHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { navbarText } from '../i18n/text/Navbar';
import { developersPageText } from '../i18n/text/DevelopersPage';

export function DevelopersPage(_props: { onNavigate?: (path: string) => void }) {
  const { locale } = useLanguage();
  const tx = developersPageText(locale);
  const navLinks = [
    { id: 'quickstart', title: tx.quickstart },
    { id: 'docs', title: tx.engineeringAndDeployment },
    { id: 'sdk', title: tx.publicSdkContracts },
    { id: 'api', title: tx.interfacesAndIntegration },
    { id: 'examples', title: tx.workflowDebugging },
  ];

  return (
    <div className="page-shell">
      <SeoHead
        title={tx.developersGettingStarted}
        description={tx.downloadConnectAnd}
        canonicalPath="/developers"
      />
      <SectionHeader
        as="h1"
        badge={navbarText(locale).developers}
        title={tx.startWithYour}
        description={tx.installationAndWorkflow}
      />

      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10">
        <nav
          aria-label={tx.developerGuides}
          className="mb-8 flex flex-wrap gap-2 lg:sticky lg:top-24 lg:mb-0 lg:flex-col lg:gap-1 lg:self-start"
        >
          {navLinks.map(section => (
            <SiteLink
              key={section.id}
              href={`#${section.id}`}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white lg:border-transparent"
            >
              {section.title}
            </SiteLink>
          ))}
        </nav>

        <div className="space-y-8">
          {/* Quickstart */}
          <section id="quickstart" className="surface-card scroll-mt-24 p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <PlayCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="section-title">{tx.quickstart}</h2>
            </div>
            <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.choosePackagesFor}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {tx.quickstartSteps.map(item => (
                <div key={item.step} className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">{item.step}</span>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <SiteLink className="btn-primary btn-sm" href="/downloads">{tx.goToDownloads}<ArrowRight className="h-3.5 w-3.5" /></SiteLink>
              <SiteLink className="text-link" href="/resources/getting-started">{tx.learnMore}<ArrowRight className="h-4 w-4" /></SiteLink>
            </div>
          </section>

          {/* Engineering & Deployment */}
          <section id="docs" className="surface-card scroll-mt-24 p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="section-title">{tx.engineeringAndDeployment}</h2>
            </div>
            <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.defineWorkstationExecution}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {tx.deploymentCards.map(card => (
                <div key={card.title} className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">{card.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{card.desc}</p>
                </div>
              ))}
            </div>
            <SiteLink className="text-link mt-6" href="/resources/local-deployment">{tx.learnMore}<ArrowRight className="h-4 w-4" /></SiteLink>
          </section>

          {/* Public SDK Contracts */}
          <section id="sdk" className="surface-card scroll-mt-24 p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <FileCode2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h2 className="section-title">{tx.publicSdkContracts}</h2>
            </div>
            <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.theSdkIs}</p>
            <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[540px] text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">{tx.sdkTableHeaders.contract}</th>
                    <th className="px-4 py-3 font-medium">{tx.sdkTableHeaders.scope}</th>
                    <th className="px-4 py-3 font-medium">{tx.sdkTableHeaders.role}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {tx.sdkContracts.map(row => (
                    <tr key={row.name} className="bg-white dark:bg-zinc-900/40">
                      <td className="px-4 py-3 font-mono font-medium text-emerald-700 dark:text-emerald-400">{row.name}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{row.peers}</td>
                      <td className="px-4 py-3 leading-relaxed text-zinc-700 dark:text-zinc-300">{row.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SiteLink className="text-link mt-6" href="/resources/sdk-contracts">{tx.learnMore}<ArrowRight className="h-4 w-4" /></SiteLink>
          </section>

          {/* Interfaces & Industrial Integration */}
          <section id="api" className="surface-card scroll-mt-24 p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="section-title">{tx.interfacesAndIntegration}</h2>
            </div>
            <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.interfaceAvailabilityAnd}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {tx.interfaceGroups.map(group => (
                <div key={group.title} className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{group.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {group.items.map(item => (
                      <span key={item} className="tag font-mono text-[11px]">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-5">
              <SiteLink className="text-link" href="/resources/plc-integration-guide">{tx.readPlcGuide}<ArrowRight className="h-4 w-4" /></SiteLink>
              <SiteLink className="text-link" href="/contact">{tx.discussRequirements}<ArrowRight className="h-4 w-4" /></SiteLink>
            </div>
          </section>

          {/* Lua Scripting & Workflow Debugging */}
          <section id="examples" className="surface-card scroll-mt-24 p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Code2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="section-title">{tx.workflowDebugging}</h2>
            </div>
            <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.inspectNodeInputs}</p>
            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-xs text-zinc-400">
                <span className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5 text-emerald-400" />{tx.luaSnippetTitle}</span>
                <span className="text-[10px] uppercase text-zinc-500">LUA</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-zinc-300"><code>{tx.luaSnippetCode}</code></pre>
            </div>
            <SiteLink className="text-link mt-6" href="/resources/workflow-debugging">{tx.learnMore}<ArrowRight className="h-4 w-4" /></SiteLink>
          </section>
        </div>
      </div>
    </div>
  );
}
