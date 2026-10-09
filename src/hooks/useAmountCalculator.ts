import { useMemo, useState } from 'react';
import { CURRENCIES } from '@/constants/currencies';
import { useAppSelector } from '@/store/hooks';
import { numberFormat } from '@/utils/intl';

export type CalculatorOperator = '+' | '-' | '×' | '÷';

const OPERATORS: CalculatorOperator[] = ['+', '-', '×', '÷'];

function isOperator(value: string): value is CalculatorOperator {
  return (OPERATORS as string[]).includes(value);
}

function compute(a: number, b: number, operator: CalculatorOperator): number {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? a : a / b;
  }
}

/** Evaluasi kiri-ke-kanan (tanpa prioritas operator), sama dengan web. */
function evaluateTerms(terms: string[]): number {
  if (terms.length === 0) {
    return 0;
  }
  let result = parseFloat(terms[0]) || 0;
  for (let i = 1; i + 1 < terms.length; i += 2) {
    result = compute(
      result,
      parseFloat(terms[i + 1]) || 0,
      terms[i] as CalculatorOperator,
    );
  }
  return result;
}

/**
 * State kalkulator nominal (port use-amount-calculator web): term angka/operator,
 * tampilan nilai, dan ekspresi "45.000 + 12.000".
 */
export function useAmountCalculator(initialValue: number) {
  const currency = useAppSelector(state => state.settings.currency);
  const decimalPlaces = useAppSelector(state => state.settings.decimalPlaces);
  const locale =
    CURRENCIES.find(item => item.code === currency)?.locale ?? 'en-US';

  const { decimalSeparator, group } = useMemo(() => {
    const decimal = numberFormat(locale).format(1.1).charAt(1);
    const grouping = numberFormat(locale, {
      maximumFractionDigits: 0,
    });
    return { decimalSeparator: decimal, group: grouping };
  }, [locale]);

  const formatTerm = (raw: string) => {
    const [intPart, decPart] = raw.split('.');
    const grouped = group.format(Number(intPart || '0') || 0);
    return decPart === undefined
      ? grouped
      : `${grouped}${decimalSeparator}${decPart}`;
  };

  const [terms, setTerms] = useState<string[]>([
    initialValue !== 0 ? String(initialValue) : '0',
  ]);
  const [awaitingNewValue, setAwaitingNewValue] = useState(false);

  const handleDigit = (digit: string) => {
    if (awaitingNewValue) {
      setTerms([...terms, digit]);
      setAwaitingNewValue(false);
      return;
    }
    const last = terms[terms.length - 1];
    setTerms([...terms.slice(0, -1), last === '0' ? digit : last + digit]);
  };

  const handleDecimal = () => {
    if (awaitingNewValue) {
      setTerms([...terms, '0.']);
      setAwaitingNewValue(false);
      return;
    }
    const last = terms[terms.length - 1];
    if (!last.includes('.')) {
      setTerms([...terms.slice(0, -1), `${last}.`]);
    }
  };

  const handleTripleZero = () => {
    if (awaitingNewValue) {
      setTerms([...terms, '0']);
      setAwaitingNewValue(false);
      return;
    }
    const last = terms[terms.length - 1];
    if (last !== '0') {
      setTerms([...terms.slice(0, -1), `${last}000`]);
    }
  };

  const handleBackspace = () => {
    const last = terms[terms.length - 1];
    if (isOperator(last)) {
      setTerms(terms.slice(0, -1));
      setAwaitingNewValue(false);
    } else if (last.length > 1) {
      setTerms([...terms.slice(0, -1), last.slice(0, -1)]);
    } else if (terms.length === 1) {
      setTerms(['0']);
    } else {
      setTerms(terms.slice(0, -1));
      setAwaitingNewValue(false);
    }
  };

  const handleOperator = (operator: CalculatorOperator) => {
    const last = terms[terms.length - 1];
    setTerms(
      isOperator(last)
        ? [...terms.slice(0, -1), operator]
        : [...terms, operator],
    );
    setAwaitingNewValue(true);
  };

  const value = evaluateTerms(terms);
  const lastTerm = terms[terms.length - 1];
  const displayValue =
    terms.length === 1 && lastTerm.includes('.')
      ? formatTerm(lastTerm)
      : numberFormat(locale, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits:
            terms.length === 1 ? decimalPlaces : Math.max(decimalPlaces, 2),
        }).format(value);
  const expressionDisplay = terms
    .map((term, index) =>
      index % 2 === 1 ? ` ${term === '-' ? '−' : term} ` : formatTerm(term),
    )
    .join('');

  return {
    value,
    displayValue,
    expressionDisplay,
    hasExpression: terms.length > 1,
    decimalSeparator,
    handleDigit,
    handleDecimal,
    handleTripleZero,
    handleBackspace,
    handleOperator,
  };
}
