import React from 'react';
import { motion } from 'framer-motion';

const GITBOOK_PATTERN = /docs\.neoflix\.care/i;

// Render markdown-style content: [text](url), **bold**, *italic*, newlines
function transformLinks(text) {
  if (!text) return '';
  return text
    .replace(/\n/g, '<br/>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
      if (GITBOOK_PATTERN.test(url)) {
        const pathParts = url.replace(/^https?:\/\/docs\.neoflix\.care\/?/, '').split('/');
        const lastPart = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'page';
        const cleanSlug = lastPart
          .replace(/^\d+\.-?/, '')
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('_');
        return `<a href="/Toolbox-${cleanSlug}" style="font-family: Inter, sans-serif; font-weight: 700; font-size: 16px; color: #529C9C; text-decoration: underline;">${label}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener" style="font-family: Inter, sans-serif; font-weight: 700; font-size: 16px; color: #152536; text-decoration: none; transition: color 150ms;" onmouseover="this.style.color='#529C9C';this.style.textDecoration='underline'" onmouseout="this.style.color='#152536';this.style.textDecoration='none'">${label}</a>`;
    })
    .replace(/(?<!\bhref=")(https?:\/\/\S+)(?!")/g, (url) =>
      `<a href="${url}" target="_blank" rel="noopener" style="font-family: Inter, sans-serif; font-weight: 700; font-size: 16px; color: #152536; text-decoration: none; transition: color 150ms;" onmouseover="this.style.color='#529C9C';this.style.textDecoration='underline'" onmouseout="this.style.color='#152536';this.style.textDecoration='none'">${url}</a>`
    );
}

/**
 * Individual content section with animations
 *
 * @param {Object} props
 * @param {Object} props.section - Section data (id, title, content, etc.)
 * @param {number} props.index - Section index for stagger animation
 * @param {Object} props.variants - Framer motion variants
 * @param {string} props.className - Custom class for section background
 * @param {Object} props.style - Additional inline styles
 */
export default function ContentSection({
  section,
  index,
  variants,
  className = 'bg-gradient-to-br from-stone-50 to-fuchsia-50',
  style = {},
}) {
  const { id, title, content, rawContent } = section;

  // Support both pre-transformed content and raw content
  const displayContent = rawContent
    ? transformLinks(rawContent)
    : content || '';

  return (
    <motion.section
      key={id}
      id={id}
      className={`scroll-mt-24 mb-8 rounded-xl border border-[#e7dfd7] shadow-md p-6 md:p-8 ${className}`}
      style={style}
      variants={variants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <h2
        className="mb-6 not-prose"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize: '40px',
          color: '#383437',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {displayContent && (
        <p
          className="mb-4"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            color: '#666666',
            maxWidth: '28rem',
            marginLeft: 0,
            marginRight: 0,
            whiteSpace: 'pre-wrap',
          }}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      )}
      {/* Support for custom children via section.children */}
      {section.children}
    </motion.section>
  );
}
