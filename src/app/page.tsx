'use client';

import Navbar from '@/components/Navbar';
import ProfileEditor from '@/components/Dashboard/ProfileEditor';
import Badges from '@/components/Badges';
import OnboardingWizard from '@/components/Onboarding/OnboardingWizard';
import { useAuthStore } from '@/store/auth';
import { useNavStore } from '@/store/nav';

export default function Home() {
  const { isConnected } = useAuthStore();
  const { activeSection } = useNavStore();

  return (
    <main className="min-h-screen bg-lc-black lc-grid-bg">
      <Navbar />
      {!isConnected && activeSection === 'onboarding' ? (
        <OnboardingWizard />
      ) : activeSection === 'profile' || (!isConnected && activeSection !== 'onboarding') ? (
        <ProfileEditor />
      ) : activeSection === 'badges' ? (
        <Badges />
      ) : null}
    </main>
  );
}

