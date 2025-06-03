import React from 'react';

const SectionDebugger = ({ sections }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed top-20 right-4 bg-black/80 text-white p-4 rounded-lg text-xs">
      {sections.map((section, idx) => (
        <div key={idx}>
          Section {idx}: {section.state}
        </div>
      ))}
    </div>
  );
};

export default SectionDebugger; 