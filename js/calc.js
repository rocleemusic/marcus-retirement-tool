/* Pure financial math — no DOM access. */

/**
 * Retirement target: 25× of 80% of annual income.
 */
function calcTarget(annualIncome) {
  return 25 * (annualIncome * 0.8);
}

/**
 * Future value at 7% annual growth.
 *   savings × 1.07^n  +  (monthly × 12) × (1.07^n − 1) / 0.07
 */
function calcFV(savings, monthly, n) {
  if (n <= 0) return savings;
  var rn = Math.pow(1.07, n);
  return savings * rn + (monthly * 12) * (rn - 1) / 0.07;
}

/**
 * Gap ratio: proportion of target still unmet.
 *   > 0    = behind (positive gap)
 *   ≤ 0    = on track or ahead
 */
function calcGapRatio(fv, target) {
  if (target <= 0) return 0;
  return (target - fv) / target;
}

/**
 * Rough extra monthly savings needed to close the gap over n years.
 */
function calcExtraMonthlyNeeded(fv, target, n) {
  if (n <= 0 || fv >= target) return 0;
  var shortfall = target - fv;
  var rn = Math.pow(1.07, n);
  return Math.ceil((shortfall * 0.07) / ((rn - 1) * 12));
}

/** Format a number as a USD currency string, no cents. */
function formatCurrency(n) {
  return '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
}
