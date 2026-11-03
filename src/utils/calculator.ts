export type Operator = '+' | '−' | '×' | '÷' | null;

export interface CalculatorState {
  currentDisplay: string;
  previousValue: string | null;
  activeOperator: Operator;
  expressionHistory: string;
  waitingForNewOperand: boolean;
  isLocked: boolean;
  pendingResult: string | null;
}

export const initialCalculatorState: CalculatorState = {
  currentDisplay: '0',
  previousValue: null,
  activeOperator: null,
  expressionHistory: '',
  waitingForNewOperand: false,
  isLocked: false,
  pendingResult: null,
};

/**
 * Format raw number string for beautiful visual display with commas
 */
export function formatDisplayNumber(value: string): string {
  if (value === 'Error' || value === 'Undefined' || value === 'NaN' || value === 'Infinity') {
    return value;
  }

  // Handle negative sign
  const isNegative = value.startsWith('-');
  const cleanValue = isNegative ? value.slice(1) : value;

  // Split integer and decimal parts
  const parts = cleanValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : null;

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const result = decimalPart !== null
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;

  return isNegative ? `-${result}` : result;
}

/**
 * Clean floating point arithmetic imprecision (e.g. 0.1 + 0.2 = 0.3)
 */
export function cleanFloat(val: number): string {
  if (!Number.isFinite(val)) {
    return 'Error';
  }
  // Round to 10 decimal places to eliminate IEEE-754 precision artifacts
  const rounded = Math.round(val * 1e10) / 1e10;
  
  // If the number is huge, use exponential or string representation
  if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
    return rounded.toExponential(4);
  }
  return rounded.toString();
}

/**
 * Performs basic binary operation
 */
export function evaluateMath(firstOperand: number, secondOperand: number, operator: Operator): string {
  let result = 0;
  switch (operator) {
    case '+':
      result = firstOperand + secondOperand;
      break;
    case '−':
      result = firstOperand - secondOperand;
      break;
    case '×':
      result = firstOperand * secondOperand;
      break;
    case '÷':
      if (secondOperand === 0) {
        return 'Undefined';
      }
      result = firstOperand / secondOperand;
      break;
    default:
      return secondOperand.toString();
  }

  return cleanFloat(result);
}

/**
 * Strips formatting commas for calculation
 */
export function parseRawNumber(str: string): number {
  return parseFloat(str.replace(/,/g, ''));
}
