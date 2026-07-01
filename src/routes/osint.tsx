import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Search, Loader2, FileText, Activity, Share2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RelationshipGraph } from '../components/osint/RelationshipGraph';
import { IntelligenceTimeline } from '../components/osint/IntelligenceTimeline';
import { ThreatAssessmentCard } from '../components/osint/ThreatAssessmentCard';

export const Route = createFileRoute('/osint')({
  component: OSINTWorkspace,
})

function OSINTWorkspace() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleInvestigate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/osint/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch investigation results');
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during investigation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Search className="w-8 h-8 text-blue-600" />
              OSINT Workspace
            </h1>
            <p className="text-slate-500 mt-2 font-medium">AI-Powered Open Source Intelligence Gathering</p>
          </div>
          <form onSubmit={handleInvestigate} className="flex gap-3 w-1/2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter phone, email, domain, IP, or username..."
              className="flex-1 px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm text-slate-700 font-medium"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Investigate'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 font-medium">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && !loading && (
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Column: Assessment & Report */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <ThreatAssessmentCard 
                threatScore={result.threat_score} 
                recommendation={result.recommendation} 
              />
              
              <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 text-slate-300">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Executive Intelligence Summary
                </h3>
                <div className="prose prose-sm md:prose-base prose-invert max-w-none prose-headings:text-blue-400 prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:text-white prose-code:text-emerald-400 prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.final_report}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Right Column: Graphs & Data */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Relationship Graph */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Share2 className="w-5 h-5 text-emerald-500" />
                  Entity Relationship Graph
                </h3>
                <RelationshipGraph 
                  evidence={result.evidence} 
                  targetType={result.target_type} 
                  targetValue={result.target_value} 
                />
              </div>

              {/* Timeline */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-rose-500" />
                  Historical Activity
                </h3>
                <IntelligenceTimeline evidence={result.evidence} />
              </div>

            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Search className="w-20 h-20 mb-6 opacity-20" />
            <h2 className="text-2xl font-bold text-slate-500 mb-2">Ready to Investigate</h2>
            <p className="text-center max-w-md">
              Enter a target above to begin an AI-assisted OSINT gathering and reasoning process.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
