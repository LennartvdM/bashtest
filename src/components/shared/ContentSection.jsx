import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { renderMarkdown } from '../../utils/renderMarkdown';

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
  contentOpacity,
}) {
  const navigate = useNavigate();
  const { id, title, content, rawContent } = section;

  // Support both pre-transformed content and raw content
  const displayContent = rawContent
    ? renderMarkdown(rawContent)
    : content || '';

  // Intercept clicks on internal links for SPA navigation
  const handleContentClick = useCallback((e) => {
    const link = e.target.closest('a[data-internal]');
    if (link) {
      e.preventDefault();
      navigate(link.getAttribute('href'));
    }
  }, [navigate]);

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
      <div style={contentOpacity != null ? { opacity: contentOpacity, transition: contentOpacity < 1 ? 'opacity 0.05s ease-in' : 'opacity 0.1s ease-out' } : undefined}>
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
            onClick={handleContentClick}
          />
        )}
        {/* Support for custom children via section.children */}
        {section.children}
      </div>
    </motion.section>
  );
}
