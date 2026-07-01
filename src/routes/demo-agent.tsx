import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AppShell as Layout } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/demo-agent')({
  component: DemoAgentPage,
});

function DemoAgentPage() {
  const [step, setStep] = useState(1);
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [objective, setObjective] = useState('Create a demo showing how to use your platform');
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [voice, setVoice] = useState('en-US-AriaNeural');

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/demo/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl, objective }),
      });

      if (!response.ok) throw new Error('Failed to generate plan');
      const data = await response.json();
      setPlan(data);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setError('');
    setStep(3); // Move to executing step

    try {
      const response = await fetch('http://localhost:8000/api/demo/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl, plan, voice }),
      });

      if (!response.ok) throw new Error('Failed to execute demo');
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStep(2); // Go back if error
    } finally {
      setLoading(false);
    }
  };

  const updateAction = (index: number, field: string, value: string) => {
    const newActions = [...plan.actions];
    newActions[index][field] = value;
    setPlan({ ...plan, actions: newActions });
  };

  const removeAction = (index: number) => {
    const newActions = plan.actions.filter((_: any, i: number) => i !== index);
    setPlan({ ...plan, actions: newActions });
  };

  const addAction = () => {
    setPlan({
      ...plan,
      actions: [
        ...plan.actions,
        { action_type: 'wait', narration: '', selector: '', value: '' },
      ],
    });
  };

  return (
    <Layout title="Demo Agent">
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Autonomous Demo Agent</h1>
          <p className="text-muted-foreground">
            Generate, review, and execute autonomous video demos.
          </p>
          
          <div className="flex items-center gap-4 mt-6 text-sm font-medium text-muted-foreground">
            <span className={step === 1 ? 'text-primary font-bold' : ''}>1. Setup</span>
            <span className="opacity-50">&gt;</span>
            <span className={step === 2 ? 'text-primary font-bold' : ''}>2. Edit Script</span>
            <span className="opacity-50">&gt;</span>
            <span className={step === 3 ? 'text-primary font-bold' : ''}>3. Record</span>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive rounded-lg p-4 mb-8 border border-destructive/20">
            <h3 className="font-semibold mb-1">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <form onSubmit={handleGeneratePlan} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input
                  id="targetUrl"
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="objective">Demo Objective</Label>
                <Textarea
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="E.g., Create a demo showing how to use the checkout flow"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Analyzing Website & Generating Script...' : 'Generate Demo Script'}
              </Button>
            </form>
          </div>
        )}

        {step === 2 && plan && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input 
                      value={plan.title} 
                      onChange={(e) => setPlan({...plan, title: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={plan.description} 
                      onChange={(e) => setPlan({...plan, description: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="space-y-4 border-l border-border pl-6">
                  <div>
                    <Label>Narrator Voice</Label>
                    <p className="text-xs text-muted-foreground mb-2">Choose the voice actor for the video narration.</p>
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US-AriaNeural">Aria (US Female)</SelectItem>
                        <SelectItem value="en-US-GuyNeural">Guy (US Male)</SelectItem>
                        <SelectItem value="en-GB-SoniaNeural">Sonia (UK Female)</SelectItem>
                        <SelectItem value="en-GB-RyanNeural">Ryan (UK Male)</SelectItem>
                        <SelectItem value="en-AU-NatashaNeural">Natasha (AU Female)</SelectItem>
                        <SelectItem value="en-AU-WilliamNeural">William (AU Male)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Demo Actions</h3>
                <Button variant="outline" size="sm" onClick={addAction}>
                  + Add Action
                </Button>
              </div>
              
              {plan.actions.map((action: any, index: number) => (
                <div key={index} className="bg-card rounded-xl border border-border p-4 shadow-sm flex gap-4">
                  <div className="flex-none pt-2 font-bold text-muted-foreground w-8 text-right">
                    {index + 1}.
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Action Type</Label>
                        <Select 
                          value={action.action_type}
                          onValueChange={(val) => updateAction(index, 'action_type', val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="navigate">Navigate</SelectItem>
                            <SelectItem value="click">Click</SelectItem>
                            <SelectItem value="fill">Fill</SelectItem>
                            <SelectItem value="wait">Wait</SelectItem>
                            <SelectItem value="hover">Hover</SelectItem>
                            <SelectItem value="scroll">Scroll</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(action.action_type === 'click' || action.action_type === 'fill' || action.action_type === 'hover') && (
                        <div className="space-y-2">
                          <Label>Selector (CSS)</Label>
                          <Input 
                            value={action.selector || ''} 
                            onChange={(e) => updateAction(index, 'selector', e.target.value)} 
                            placeholder="e.g., button#submit"
                          />
                        </div>
                      )}

                      {(action.action_type === 'navigate' || action.action_type === 'fill' || action.action_type === 'wait') && (
                        <div className="space-y-2">
                          <Label>{action.action_type === 'wait' ? 'Wait Time (ms)' : 'Value'}</Label>
                          <Input 
                            value={action.value || ''} 
                            onChange={(e) => updateAction(index, 'value', e.target.value)} 
                            placeholder={action.action_type === 'wait' ? '2000' : 'Value'}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Narration Script</Label>
                      <Textarea 
                        value={action.narration || ''} 
                        onChange={(e) => updateAction(index, 'narration', e.target.value)} 
                        placeholder="What should the AI say during this step?"
                      />
                    </div>
                  </div>
                  <div className="flex-none">
                    <Button variant="ghost" size="icon" onClick={() => removeAction(index)} className="text-destructive hover:bg-destructive/10">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C2.72386 3.5 2.5 3.72386 2.5 4C2.5 4.27614 2.72386 4.5 3 4.5H12C12.2761 4.5 12.5 4.27614 12.5 4C12.5 3.72386 12.2761 3.5 12 3.5H3ZM3.5 5.5V13.5C3.5 13.7761 3.72386 14 4 14H11C11.2761 14 11.5 13.7761 11.5 13.5V5.5H3.5ZM6.5 7C6.77614 7 7 7.22386 7 7.5V11.5C7 11.7761 6.77614 12 6.5 12C6.22386 12 6 11.7761 6 11.5V7.5C6 7.22386 6.22386 7 6.5 7ZM9 7.5C9 7.22386 8.77614 7 8.5 7C8.22386 7 8 7.22386 8 7.5V11.5C8 11.7761 8.22386 12 8.5 12C8.77614 12 9 11.7761 9 11.5V7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleExecute} className="flex-1">Record Demo</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm text-center">
            {loading ? (
              <div className="flex flex-col items-center py-10">
                <svg className="animate-spin mb-6 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h3 className="text-xl font-medium">Recording in Progress...</h3>
                <p className="text-muted-foreground mt-2">The agent is navigating the site, narrating, and recording the video.</p>
              </div>
            ) : result ? (
              <div className="py-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Demo Generation Complete!</h3>
                <p className="text-muted-foreground mb-6">{result.message}</p>
                
                {result.youtube_url && (
                  <a 
                    href={result.youtube_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Watch on YouTube
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </a>
                )}
                
                {result.video_path && !result.youtube_url && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Saved locally to:</p>
                    <code className="text-xs bg-black/10 dark:bg-black/30 px-2 py-1 rounded mt-1 inline-block">
                      {result.video_path}
                    </code>
                  </div>
                )}

                <div className="mt-8">
                  <Button variant="outline" onClick={() => {setStep(1); setResult(null); setPlan(null);}}>
                    Create Another Demo
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Layout>
  );
}
