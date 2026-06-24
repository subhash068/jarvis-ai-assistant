import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';

export const Route = createFileRoute('/docs')({
  component: DocsPortal,
});

function DocsPortal() {
  const [activeSection, setActiveSection] = useState('Getting Started');

  const sections = [
    'Getting Started',
    'Installation',
    'Language Basics',
    'Functions',
    'Classes',
    'AI Runtime',
    'Agents',
    'Memory',
    'VM',
    'Compiler Internals'
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 p-6 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-bold mb-6">Documentation</h2>
        <ul className="space-y-2">
          {sections.map(sec => (
            <li 
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${activeSection === sec ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {sec}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto bg-card">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{activeSection}</h1>
          <div className="prose prose-zinc dark:prose-invert">
            {activeSection === 'Getting Started' && (
              <>
                <p className="text-lg text-muted-foreground mb-6">
                  Welcome to Cognix! Cognix is an Agent-Oriented programming language designed to seamlessly blend deterministic logic with non-deterministic autonomous agents.
                </p>
                <h3>Why Cognix?</h3>
                <p>
                  Built from the ground up, Cognix treats Agents, Tasks, and Memories as first-class citizens. We introduce a static type system and a formal runtime model for multi-agent workflows.
                </p>
                <h3>Try it out</h3>
                <div className="bg-zinc-950 rounded-lg p-4 my-6 shadow-inner relative group">
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded hover:bg-zinc-700">Run Interactive</button>
                  </div>
                  <pre className="text-sm font-mono text-zinc-300 m-0">
                    <code className="language-cognix">
{`// Your first Cognix program
let greeting: String = "Hello";
print(greeting);

// Using the Agent primitive
agent Researcher {
  task search()
}

workflow BuildSystem {
  Researcher -> Planner -> Executor
}`}
                    </code>
                  </pre>
                </div>
              </>
            )}

            {activeSection === 'Installation' && (
              <>
                <p>To install Cognix globally on your system, use the appropriate command for your OS.</p>
                <h3>Windows</h3>
                <pre><code>winget install cognix</code></pre>
                <h3>Linux/macOS</h3>
                <pre><code>curl -fsSL install.cognix.dev | sh</code></pre>
                
                <p className="mt-8 p-4 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 rounded-lg border border-yellow-500/20">
                  <strong>Note:</strong> Cognix is currently in Phase 4 (v2.0) development. Expect breaking changes.
                </p>
              </>
            )}

            {activeSection === 'AI Runtime' && (
              <>
                <p>The core philosophy of Cognix is the built-in Agent Runtime. These primitives compile down to a high-performance Rust execution environment.</p>
                <ul>
                  <li><code>agent</code> - Define a stateful actor</li>
                  <li><code>task</code> - Define a non-deterministic behavior</li>
                  <li><code>memory</code> - Manage state and vector context</li>
                  <li><code>-&gt;</code> - Compose workflows</li>
                </ul>
              </>
            )}
            
            {/* Catch-all for other sections */}
            {!['Getting Started', 'Installation', 'AI Runtime'].includes(activeSection) && (
              <p className="text-muted-foreground italic">Content for {activeSection} is being written...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
