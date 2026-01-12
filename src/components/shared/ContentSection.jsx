import React from 'react';
import { motion } from 'framer-motion';

// Link transformation for content (auto-links URLs)
function transformLinks(text) {
  if (!text) return '';
  return text.replace(/(\bhttps?:\/\/\S+)/g, (url) =>
    `<a href="${url}" style="font-family: Inter, sans-serif; font-weight: 700; font-size: 16px; color: #152536; text-decoration: none; transition: color 150ms;" onmouseover="this.style.color='#529C9C';this.style.textDecoration='underline'" onmouseout="this.style.color='#152536';this.style.textDecoration='none'">${url}</a>`
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
