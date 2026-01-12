// ContactSection.jsx
// CMS-ready contact section component
import React from 'react';
import { content, actions, pageStyle } from '../../data/contact';

const ContactSection = () => {
  return (
    <div
      className={`min-h-screen ${pageStyle.backgroundClassName} ${pageStyle.textClassName} flex items-center justify-center`}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-8">{content.title}</h2>
        <p className="text-xl text-slate-300 mb-12">{content.description}</p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {actions.map((action) => (
            <a
              key={action.id}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className={`px-8 py-4 rounded-lg transition-colors ${
                action.type === 'primary'
                  ? pageStyle.primaryButtonClassName
                  : pageStyle.secondaryButtonClassName
              }`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
