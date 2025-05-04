module.exports = {
  tasks: {
    dev: {
      command: 'npm run dev',
      description: 'Start development server',
      options: {
        cwd: process.cwd()
      }
    },
    build: {
      command: 'npm run build',
      description: 'Build production version',
      options: {
        cwd: process.cwd()
      }
    },
    preview: {
      command: 'npm run preview',
      description: 'Preview production build',
      options: {
        cwd: process.cwd()
      }
    }
  },
  ai: {
    enabled: true,
    model: 'gpt-4',
    temperature: 0.7,
    analyze: {
      enabled: true,
      scanDependencies: true,
      scanCode: true,
      suggestImprovements: true,
      checkBestPractices: true
    }
  }
}; 