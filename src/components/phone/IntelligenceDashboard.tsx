import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Phone, ShieldAlert, ShieldCheck, MapPin, Globe, Clock, 
  Activity, AlertTriangle, AlertCircle, FileText, Search, User, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { z } from 'zod';

const PhoneResultSchema = z.object({
  status: z.string(),
  country: z.string(),
  international_format: z.string(),
  national_format: z.string(),
  type: z.string(),
  carrier: z.string(),
  network: z.string(),
  region: z.string(),
  timezone: z.string(),
  calling_code: z.string(),
  trust_score: z.number(),
  risk_level: z.string(),
  spam_reports: z.number(),
  fraud_probability: z.number(),
  caller_category: z.string(),
  first_seen: z.string(),
  recommendation: z.string(),
  explanation: z.string(),
  spam_timeline: z.any(),
  detected_fraud_patterns: z.array(z.string()),
  similar_numbers: z.array(z.string())
});

type PhoneResult = z.infer<typeof PhoneResultSchema>;

export default function IntelligenceDashboard() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submittedNumber, setSubmittedNumber] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['phone-intelligence', submittedNumber],
    queryFn: async () => {
      if (!submittedNumber) return null;
      const response = await fetch('http://localhost:8000/api/phone/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: submittedNumber })
      });
      if (!response.ok) throw new Error('Failed to fetch intelligence');
      const result = await response.json();
      return PhoneResultSchema.parse(result);
    },
    enabled: !!submittedNumber,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      setSubmittedNumber(phoneNumber);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number (e.g. +91 9876543210)"
            className="w-full h-14 pl-12 pr-32 rounded-2xl glass-strong border border-white/10 bg-black/20 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button 
            type="submit"
            disabled={isLoading || !phoneNumber.trim()}
            className="absolute right-2 h-10 px-6 rounded-xl gradient-primary text-primary-foreground font-medium disabled:opacity-50 transition-opacity"
          >
            {isLoading ? 'Analyzing...' : 'Investigate'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/50 text-destructive-foreground">
          Error analyzing number: {(error as Error).message}
        </div>
      )}

      {/* Results */}
      {data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Main Intelligence Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold font-mono tracking-tight">{data.international_format}</h2>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{data.country} · {data.region}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className={`text-4xl font-bold tracking-tighter ${data.trust_score >= 70 ? 'text-emerald-400' : data.trust_score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {data.trust_score}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Trust Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <InfoItem icon={<Phone />} label="Carrier" value={data.carrier} />
                <InfoItem icon={<Activity />} label="Type" value={data.type} />
                <InfoItem icon={<MapPin />} label="Timezone" value={data.timezone} />
                <InfoItem icon={<User />} label="Category" value={data.caller_category} />
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {data.risk_level === 'SAFE' ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      AI Security Report
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        data.risk_level === 'SAFE' ? 'bg-emerald-500/20 text-emerald-300' : 
                        data.risk_level === 'HIGH RISK' ? 'bg-rose-500/20 text-rose-300' : 
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {data.risk_level}
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {data.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spam Trend Chart */}
            <div className="glass p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Spam Activity Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(data.spam_timeline.Trend || {}).map(([month, count]) => ({ month, count }))}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                    />
                    <Bar dataKey="count" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Fraud Intelligence</h3>
              
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-bold">{data.fraud_probability}%</span>
                  <span className="text-sm text-muted-foreground mb-1">Probability</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" 
                    style={{ width: `${data.fraud_probability}%` }}
                  />
                </div>
              </div>

              {data.detected_fraud_patterns.length > 0 ? (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase mb-3">Detected Patterns</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.detected_fraud_patterns.map(pattern => (
                      <span key={pattern} className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" /> No known fraud patterns detected.
                </div>
              )}
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Recent Reports</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">{data.spam_timeline.Today}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold">{data.spam_timeline['This Week']}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-semibold">{data.spam_timeline['This Month']}</span>
                </div>
              </div>
            </div>

            {data.similar_numbers.length > 0 && (
              <div className="glass p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Similar Numbers
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Common in sequential scam campaigns</p>
                <div className="space-y-2">
                  {data.similar_numbers.map(num => (
                    <div key={num} className="font-mono text-sm p-2 rounded bg-white/5 text-center">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
        <span className="[&>svg]:w-3 [&>svg]:h-3">{icon}</span>
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
