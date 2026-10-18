import { formatNumber, formatAmount, formatCustomerAmount, formatSupplierAmount, formatCurrencyAmount } from '../src/lib/formatters';

function assertEqual(actual: string, expected: string, testName: string) {
  if (actual !== expected) {
    throw new Error(`FAIL [${testName}]: expected "${expected}", got "${actual}"`);
  }
  console.log(`PASS [${testName}]: "${actual}" === "${expected}"`);
}

function runTests() {
  console.log('--- Running Numeric Formatter Tests ---');

  // Exact requirements from specification
  assertEqual(formatNumber(7100), '7,100', '7100 -> 7,100');
  assertEqual(formatNumber(50000), '50,000', '50000 -> 50,000');
  assertEqual(formatNumber(100000), '100,000', '100000 -> 100,000');
  assertEqual(formatNumber(750000), '750,000', '750000 -> 750,000 (Supplier Bug Fix)');
  assertEqual(formatNumber(1000000), '1,000,000', '1000000 -> 1,000,000');

  // Decimal values
  assertEqual(formatNumber(7100.25), '7,100.25', '7100.25 -> 7,100.25');
  assertEqual(formatNumber(750000.5), '750,000.5', '750000.5 -> 750,000.5');
  assertEqual(formatNumber(750000.50, { fixedDecimals: true }), '750,000.50', '750000.50 fixedDecimals -> 750,000.50');

  // String numeric inputs (from input fields or DB strings)
  assertEqual(formatNumber('7100'), '7,100', 'string "7100" -> 7,100');
  assertEqual(formatNumber('750000'), '750,000', 'string "750000" -> 750,000');
  assertEqual(formatNumber('750000.50'), '750,000.5', 'string "750000.50" -> 750,000.5');
  assertEqual(formatNumber('750000.50', { fixedDecimals: true }), '750,000.50', 'string "750000.50" fixed -> 750,000.50');

  // Edge cases & null safety
  assertEqual(formatNumber(null), '0', 'null -> 0');
  assertEqual(formatNumber(undefined), '0', 'undefined -> 0');
  assertEqual(formatNumber(''), '0', 'empty string -> 0');
  assertEqual(formatNumber(0), '0', '0 -> 0');

  // Aliases
  assertEqual(formatSupplierAmount(750000), '750,000', 'formatSupplierAmount(750000)');
  assertEqual(formatCustomerAmount(100000), '100,000', 'formatCustomerAmount(100000)');
  assertEqual(formatAmount(50000), '50,000', 'formatAmount(50000)');
  assertEqual(formatCurrencyAmount(750000, 'YER'), '750,000 YER', 'formatCurrencyAmount(750000, YER)');

  // No Arabic digits test (ASCII check: only 0-9, comma, period, minus, space, alpha)
  const allFormatted = [
    formatNumber(7100),
    formatNumber(50000),
    formatNumber(100000),
    formatNumber(750000),
    formatNumber(1000000),
    formatNumber(750000.5),
    formatNumber(7100.25),
  ];

  const arabicDigitsRegex = /[\u0660-\u0669\u06F0-\u06F9]/;
  for (const str of allFormatted) {
    if (arabicDigitsRegex.test(str)) {
      throw new Error(`FAIL [Arabic Digits Check]: Found Arabic-indic digits in "${str}"`);
    }
  }
  console.log('PASS [Arabic Digits Check]: No Arabic-Indic digits found in formatted outputs.');

  console.log('--- All Formatter Tests Passed Successfully! ---');
}

runTests();
