import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IntelligenceTimelineProps {
  evidence: any;
}

export function IntelligenceTimeline({ evidence }: IntelligenceTimelineProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mock data for the timeline based on evidence
  const data = [
    { year: '2021', events: 1, label: 'Domain Registered' },
    { year: '2022', events: 2, label: 'Business Started' },
    { year: '2023', events: 5, label: 'First Spam Reports' },
    { year: '2024', events: 15, label: 'High Activity' },
    { year: '2025', events: 8, label: 'Current Status' },
  ];

  if (!isMounted) {
    return <div className="h-[300px] w-full mt-4 flex items-center justify-center border border-slate-200 rounded-lg">Loading Timeline...</div>;
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Activity Timeline</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip 
            formatter={(value: any, name: any, props: any) => [props.payload.label, 'Event']} 
          />
          <Line type="monotone" dataKey="events" stroke="#3b82f6" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
