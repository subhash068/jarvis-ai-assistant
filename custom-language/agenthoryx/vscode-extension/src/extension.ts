// Simulated extension entry point for Phase 4
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Agenthoryx extension is now active!');

  // Register a command to view AST
  let viewAST = vscode.commands.registerCommand('agenthoryx.viewAST', () => {
    vscode.window.showInformationMessage('Agenthoryx: AST Viewer opened');
    // Here we would run the compiler to output AST and display in a webview
  });

  // Register a command to view Bytecode
  let viewBytecode = vscode.commands.registerCommand('agenthoryx.viewBytecode', () => {
    vscode.window.showInformationMessage('Agenthoryx: Bytecode Viewer opened');
    // Run `agenthoryx compile` and show `.axb` disassembly
  });

  // Register completion item provider for standard library / AI
  let provider = vscode.languages.registerCompletionItemProvider(
    'agenthoryx',
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const aiCompletion = new vscode.CompletionItem('ai');
        aiCompletion.commitCharacters = ['.'];
        
        const chatCompletion = new vscode.CompletionItem('chat');
        chatCompletion.kind = vscode.CompletionItemKind.Method;
        chatCompletion.insertText = new vscode.SnippetString('chat("${1:prompt}")');

        const embedCompletion = new vscode.CompletionItem('embed');
        embedCompletion.kind = vscode.CompletionItemKind.Method;
        
        return [aiCompletion, chatCompletion, embedCompletion];
      }
    },
    '.' // Trigger on dot
  );

  context.subscriptions.push(viewAST, viewBytecode, provider);
}

export function deactivate() {}
