import { create } from 'zustand';

import { Plan } from '../types';

type UsePlanStore = {
  isDeletingConfirmOpen: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setIsDeletingConfirmOpen: (value: boolean) => void;
  plan: Plan | null;
  setPlan: (plan: Plan | null) => void;
};

export const usePlanStore = create<UsePlanStore>((set) => ({
  isDeletingConfirmOpen: false,
  setIsDeletingConfirmOpen: (isConfirmOpen) => set({ isDeletingConfirmOpen: isConfirmOpen }),
  plan: null,
  isEditing: false,
  setIsEditing: (isEditing) => set({ isEditing }),
  setPlan: (plan) => set({ plan }),
}));
