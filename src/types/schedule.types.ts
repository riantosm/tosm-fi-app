import type { CategoryType } from './category.types';

export type ScheduleType = CategoryType;
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Schedule {
  idSchedule: string;
  title: string;
  notes: string;
  type: ScheduleType;
  amount: number;
  idWallet: string;
  idCategory: string;
  idSubCategory: string | null;
  frequency: ScheduleFrequency;
  /** 0=Minggu..6=Sabtu — hanya berarti saat frequency === 'weekly'. */
  weekdays: number[];
  /** Diturunkan server dari startDate. */
  dayOfMonth: number | null;
  /** Diturunkan server dari startDate — hanya untuk yearly. */
  month: number | null;
  startDate: string;
  isActive: boolean;
}

export type ScheduleInput = Omit<
  Schedule,
  'idSchedule' | 'dayOfMonth' | 'month' | 'isActive'
>;
