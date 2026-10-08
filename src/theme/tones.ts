import { colors } from '@/theme/colors';

/** Nada tile ikon menu (DESIGN_SYSTEM.md §6.12): latar soft + ikon text. */
export type Tone = 'primary' | 'income' | 'expense' | 'investment' | 'neutral';

export const toneColors: Record<Tone, { soft: string; text: string }> = {
  primary: { soft: colors.primarySoft, text: colors.primaryText },
  income: { soft: colors.incomeSoft, text: colors.incomeText },
  expense: { soft: colors.expenseSoft, text: colors.expenseText },
  investment: { soft: colors.investmentSoft, text: colors.investmentText },
  neutral: { soft: colors.surface, text: colors.text2 },
};
