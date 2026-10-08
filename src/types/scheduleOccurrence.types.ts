import type { ScheduleType } from './schedule.types';
import type { Transaction } from './transaction.types';

export type ScheduleOccurrenceStatus = 'pending' | 'paid' | 'cancelled';

export interface ScheduleOccurrence {
  idOccurrence: string;
  idSchedule: string;
  dueDate: string;
  status: ScheduleOccurrenceStatus;
  type: ScheduleType;
  title: string;
  amount: number;
  idWallet: string;
  idCategory: string;
  idSubCategory: string | null;
  idTransaction: string | null;
}

export interface PayOccurrenceInput {
  amount?: number;
  date?: string;
  idWallet?: string;
  idCategory?: string;
  idSubCategory?: string | null;
  title?: string;
  notes?: string;
}

export interface PayOccurrenceResult {
  transaction: Transaction;
  occurrence: ScheduleOccurrence;
}
