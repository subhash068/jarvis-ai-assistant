import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '../components/layout/AppShell';
import IntelligenceDashboard from '../components/phone/IntelligenceDashboard';

export const Route = createFileRoute('/phone-intelligence')({
  component: PhoneIntelligencePage,
});

function PhoneIntelligencePage() {
  return (
    <AppShell title="Phone Intelligence" subtitle="Investigate numbers before you answer">
      <IntelligenceDashboard />
    </AppShell>
  );
}
