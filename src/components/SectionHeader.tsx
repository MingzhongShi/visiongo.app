import React from 'react';

interface SectionHeaderProps {
  /** Short name of the page or section above the title (for example the navigation label). */
  badge: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2';
}

/** Title block at the top of a page or section: eyebrow, heading and an optional lead paragraph. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  description,
  align = 'left',
  className = '',
  as: HeadingTag = 'h2',
}) => (
  <div className={`mb-10 md:mb-12 ${align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}>
    <p className="eyebrow mb-3">{badge}</p>
    <HeadingTag className={HeadingTag === 'h1' ? 'page-title' : 'section-title'}>{title}</HeadingTag>
    {description && <p className="lead mt-4">{description}</p>}
  </div>
);
