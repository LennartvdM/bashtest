import React from 'react';
import Section from '../components/Section';

export default function Toolbox() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 pb-20">
      <Section id="tools" title="Development Tools">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Frontend Development</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>React & React Router</li>
              <li>Tailwind CSS</li>
              <li>Framer Motion</li>
              <li>Vite</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Backend Development</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Node.js</li>
              <li>Express</li>
              <li>MongoDB</li>
              <li>RESTful APIs</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="skills" title="Technical Skills">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Languages</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>JavaScript/TypeScript</li>
              <li>Python</li>
              <li>HTML/CSS</li>
              <li>SQL</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Frameworks</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>React</li>
              <li>Next.js</li>
              <li>Express</li>
              <li>Django</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Tools</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Git & GitHub</li>
              <li>Docker</li>
              <li>AWS</li>
              <li>CI/CD</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
} 