import {
  buildHistoryExamples,
  formatChatAmount,
} from '@/utils/assistantExamples';
import type { Category, Transaction, WalletAccount } from '@/types';

const wallets = [
  { idWallet: 'w1', nameWallet: 'GoPay' },
  { idWallet: 'w2', nameWallet: 'BCA' },
] as WalletAccount[];

const categories = [
  {
    idCategory: 'c1',
    nameCategory: 'Makan',
    subCategories: [{ idSubCategory: 's1', nameSubCategory: 'Makan siang' }],
  },
] as Category[];

function tx(partial: Partial<Transaction>): Transaction {
  return {
    idTransaction: Math.random().toString(),
    type: 'expense',
    idWallet: 'w1',
    idCategory: null,
    idSubCategory: null,
    idWalletFrom: null,
    idWalletTo: null,
    title: '',
    notes: '',
    amount: 0,
    date: '2026-10-01T08:00:00.000Z',
    ...partial,
  };
}

describe('formatChatAmount', () => {
  it('memakai satuan bila tetap persis', () => {
    expect(formatChatAmount(18000, 'id-ID')).toBe('18rb');
    expect(formatChatAmount(1500000, 'id-ID')).toBe('1,5jt');
    expect(formatChatAmount(8000000, 'en-GB')).toBe('8m');
    expect(formatChatAmount(25000, 'ja-JP')).toBe('2.5万');
  });

  it('angka utuh bila satuan membulatkan', () => {
    expect(formatChatAmount(18750, 'id-ID')).toBe('18,75rb');
    expect(formatChatAmount(18755, 'id-ID')).toBe('18755');
    expect(formatChatAmount(500, 'id-ID')).toBe('500');
  });
});

describe('buildHistoryExamples', () => {
  it('kosong bila tidak ada yang berulang', () => {
    const list = [tx({ title: 'Kopi', amount: 18000 })];
    expect(buildHistoryExamples(list, wallets, categories, 'id-ID')).toEqual(
      [],
    );
  });

  it('mengelompokkan judul sama, nominal & dompet terbanyak', () => {
    const list = [
      tx({ title: 'kopi', amount: 18000, date: '2026-10-01' }),
      tx({ title: 'Kopi ', amount: 18000, idWallet: 'w2', date: '2026-10-02' }),
      tx({ title: 'Kopi', amount: 20000, date: '2026-10-03' }),
    ];
    expect(buildHistoryExamples(list, wallets, categories, 'id-ID')).toEqual([
      { kind: 'expense', label: 'Kopi', amount: '18rb', wallet: 'GoPay' },
    ]);
  });

  it('judul kosong → nama subkategori; transfer per pasangan dompet', () => {
    const list = [
      tx({ idSubCategory: 's1', amount: 25000, date: '2026-10-01' }),
      tx({ idSubCategory: 's1', amount: 25000, date: '2026-10-02' }),
      tx({
        type: 'transfer',
        idWallet: null,
        idWalletFrom: 'w2',
        idWalletTo: 'w1',
        amount: 100000,
        date: '2026-10-05',
      }),
      tx({
        type: 'transfer',
        idWallet: null,
        idWalletFrom: 'w2',
        idWalletTo: 'w1',
        amount: 100000,
        date: '2026-10-06',
      }),
      tx({ type: 'correction', title: 'x', amount: 1 }),
      tx({ type: 'correction', title: 'x', amount: 1 }),
    ];
    expect(buildHistoryExamples(list, wallets, categories, 'id-ID')).toEqual([
      { kind: 'transfer', amount: '100rb', from: 'BCA', to: 'GoPay' },
      {
        kind: 'expense',
        label: 'Makan siang',
        amount: '25rb',
        wallet: 'GoPay',
      },
    ]);
  });
});
