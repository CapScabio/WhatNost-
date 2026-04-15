import { create } from 'zustand';

export type Section = 'onboarding' | 'profile' | 'badges' | 'marketplace';

interface NavState {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

export const useNavStore = create<NavState>()((set) => ({
  activeSection: 'onboarding', // Default to onboarding or evaluate dynamically
  setActiveSection: (section) => set({ activeSection: section }),
}));
