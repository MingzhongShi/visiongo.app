import { SiteLink } from './SiteLink';
import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { productCardText } from '../i18n/text/ProductCard';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
}

const ACCENT: Record<Product['id'], { tag: string; check: string }> = {
  visionstudio: { tag: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-400', check: 'text-emerald-600 dark:text-emerald-400' },
  visionruntime: { tag: 'border-cyan-600/30 bg-cyan-500/10 text-cyan-700 dark:border-cyan-500/40 dark:text-cyan-400', check: 'text-cyan-600 dark:text-cyan-400' },
  visionedge: { tag: 'border-violet-600/30 bg-violet-500/10 text-violet-700 dark:border-violet-500/40 dark:text-violet-400', check: 'text-violet-600 dark:text-violet-400' },
  visioncloud: { tag: 'border-amber-600/30 bg-amber-500/10 text-amber-700 dark:border-amber-500/40 dark:text-amber-400', check: 'text-amber-600 dark:text-amber-400' },
};

/** A product on the home page: role, summary, three highlights and a link to its page. */
export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { locale } = useLanguage();
  const accent = ACCENT[product.id];
  return (
    <SiteLink
      href={`/products/${product.slug}`}
      onClick={event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onSelect(product.slug); } }}
      className="card-link group relative flex flex-col overflow-hidden p-7"
    >
      <div className="absolute inset-x-0 top-0 h-1 opacity-80 transition-opacity group-hover:opacity-100" style={{ backgroundColor: product.accentColor }} />
      <span className={`tag mb-4 self-start ${accent.tag}`}>{product.shortAction}</span>
      <h3 className="text-2xl font-semibold text-zinc-950 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{product.name}</h3>
      <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{product.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{product.summary}</p>
      <ul className="mt-6 flex-1 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {product.highlights.slice(0, 3).map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accent.check}`} />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
      <span className="text-link mt-6">
        {productCardText(locale).learnMore}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </SiteLink>
  );
};
