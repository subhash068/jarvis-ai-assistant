import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';

export const Route = createFileRoute('/playground')({
  component: Playground,
});

function Playground() {
  const [code, setCode] = useState('let x = 10;\nlet y = 20;\nprint(x + y);');
  const [activeTab, setActiveTab] = useState('output');

  const astData = `Program
  VariableDeclaration(x)
    Literal(10)
  VariableDeclaration(y)
    Literal(20)
  ExpressionStatement
    CallExpression(print)
      BinaryExpression(+)
        Identifier(x)
        Identifier(y)`;

  const bytecodeData = `0000 PUSH_CONST 10
0001 STORE x
0002 PUSH_CONST 20
0003 STORE y
0004 LOAD x
0005 LOAD y
0006 ADD
0007 CALL_NATIVE print
0008 HALT`;

  const outputData = `30\n\n[Process exited with code 0]`;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cognix Playground</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm">Compile</button>
          <button className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> Run
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Editor Pane */}
        <div className="flex flex-col border rounded-xl overflow-hidden bg-card">
          <div className="bg-muted px-4 py-2 text-sm font-semibold border-b">
            main.agx
          </div>
          <textarea
            className="flex-1 w-full p-4 font-mono text-sm bg-background resize-none focus:outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Inspector Pane */}
        <div className="flex flex-col border rounded-xl overflow-hidden bg-card">
          <div className="flex bg-muted border-b text-sm">
            <button 
              className={`px-4 py-2 font-semibold ${activeTab === 'output' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('output')}
            >
              Output Console
            </button>
            <button 
              className={`px-4 py-2 font-semibold ${activeTab === 'ast' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('ast')}
            >
              AST Viewer
            </button>
            <button 
              className={`px-4 py-2 font-semibold ${activeTab === 'bytecode' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('bytecode')}
            >
              Bytecode Viewer
            </button>
          </div>
          
          <div className="flex-1 p-4 bg-zinc-950 text-zinc-300 font-mono text-sm overflow-auto">
            {activeTab === 'output' && <pre>{outputData}</pre>}
            {activeTab === 'ast' && <pre>{astData}</pre>}
            {activeTab === 'bytecode' && <pre>{bytecodeData}</pre>}
          </div>
        </div>
      </div>
    </div>
  );
}
