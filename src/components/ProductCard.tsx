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

/** A product on the home page: role, summary, three highlights and a link to its page. */
export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { locale } = useLanguage();
  return (
    <SiteLink
      href={`/products/${product.slug}`}
      onClick={event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onSelect(product.slug); } }}
      className="card-link group relative flex flex-col overflow-hidden p-7"
    >
      <div className="absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity group-hover:opacity-100" style={{ backgroundColor: product.accentColor }} />
      <span className="tag mb-4 self-start" style={{ color: product.accentColor, borderColor: `${product.accentColor}40` }}>{product.shortAction}</span>
      <h3 className="text-2xl font-semibold text-white transition-colors group-hover:text-emerald-300">{product.name}</h3>
      <p className="mt-1 text-sm font-medium text-zinc-300">{product.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{product.summary}</p>
      <ul className="mt-6 flex-1 space-y-2 border-t border-zinc-800 pt-4">
        {product.highlights.slice(0, 3).map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-400">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: product.accentColor }} />
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
