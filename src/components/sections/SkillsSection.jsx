import React from 'react';

const SkillsSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-700 text-slate-200 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">Skills & Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-800/50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Frontend</h3>
            <ul className="space-y-2 text-slate-300">
              <li>React & Next.js</li>
              <li>Tailwind CSS</li>
              <li>TypeScript</li>
              <li>Responsive Design</li>
            </ul>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Backend</h3>
            <ul className="space-y-2 text-slate-300">
              <li>Node.js</li>
              <li>Python</li>
              <li>SQL & NoSQL</li>
              <li>API Design</li>
            </ul>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Tools & Others</h3>
            <ul className="space-y-2 text-slate-300">
              <li>Git & GitHub</li>
              <li>Docker</li>
              <li>AWS</li>
              <li>CI/CD</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection; 