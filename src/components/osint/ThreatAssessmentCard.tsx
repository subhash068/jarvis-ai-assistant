import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ThreatAssessmentCardProps {
  threatScore: number;
  recommendation: string;
}

export function ThreatAssessmentCard({ threatScore, recommendation }: ThreatAssessmentCardProps) {
  const getThreatLevelInfo = () => {
    if (threatScore >= 70) return { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: ShieldAlert };
    if (threatScore >= 40) return { label: 'Moderate Risk', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle };
    return { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: ShieldCheck };
  };

  const info = getThreatLevelInfo();
  const Icon = info.icon;

  return (
    <div className={`p-6 rounded-xl border ${info.border} ${info.bg} flex flex-col items-center justify-center text-center space-y-4`}>
      <Icon className={`w-16 h-16 ${info.color}`} />
      <div>
        <h3 className={`text-2xl font-bold ${info.color}`}>{info.label}</h3>
        <p className="text-4xl font-black text-slate-800 mt-2">{threatScore}<span className="text-xl text-slate-500 font-normal">/100</span></p>
        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-1">Threat Score</p>
      </div>
      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm w-full">
        <p className="text-slate-700 font-medium">{recommendation}</p>
      </div>
    </div>
  );
}
