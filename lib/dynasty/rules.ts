import type {
  Contract,
  ExtensionOption,
  CutPenaltyBreakdown,
  CapSummary,
  CutPenalty,
} from './types'

export const ACTIVE_YEAR = 2026
export const DRAFT_CAP = 200
export const FA_BUDGET = 100
export const MAX_CONSECUTIVE_YEARS = 4  // 1 original + max 3-year extension
export const MAX_EXTENSION_YEARS = 3

/**
 * Returns the salary this contract pays in `year`.
 * Returns 0 if the year is outside the contract range.
 */
export function salaryInYear(contract: Contract, year: number): number {
  const idx = year - contract.start_year
  if (idx < 0 || idx >= contract.salary_by_year.length) return 0
  return contract.salary_by_year[idx]
}

/**
 * Final year of the contract (inclusive).
 */
export function contractEndYear(contract: Contract): number {
  return contract.start_year + contract.length - 1
}

/**
 * Years remaining in the contract as of the start of `activeYear`.
 * 0 means this is the final year; negative means expired.
 */
export function yearsRemaining(contract: Contract, activeYear = ACTIVE_YEAR): number {
  return contractEndYear(contract) - activeYear
}

/**
 * True if the contract is in its final year during `activeYear`.
 */
export function isInFinalYear(contract: Contract, activeYear = ACTIVE_YEAR): boolean {
  return contractEndYear(contract) === activeYear
}

/**
 * A player can be extended only when:
 *  1. Their contract is in its final year (isInFinalYear).
 *  2. They haven't already hit the 4-consecutive-year cap with this team.
 *     The 4-year cap is checked by summing the length of this contract plus any
 *     prior contracts in the same team that this contract was extended from.
 *     Without full history, we approximate via `consecutiveYearsWithTeam`.
 */
export function isExtensionEligible(
  contract: Contract,
  consecutiveYearsWithTeam: number,
  activeYear = ACTIVE_YEAR
): boolean {
  if (contract.status !== 'active') return false
  if (!contract.extension_eligible) return false
  if (!isInFinalYear(contract, activeYear)) return false
  if (consecutiveYearsWithTeam >= MAX_CONSECUTIVE_YEARS) return false
  return true
}

/**
 * Computes the available extension options (1, 2, or 3 years).
 * `prevSalary` is the last salary in the current contract's salary_by_year.
 * `consecutiveYearsWithTeam` limits how many extension years are available.
 */
export function computeExtensionOptions(
  contract: Contract,
  consecutiveYearsWithTeam: number,
  activeYear = ACTIVE_YEAR
): ExtensionOption[] {
  if (!isExtensionEligible(contract, consecutiveYearsWithTeam, activeYear)) return []

  const yearsAvailable = Math.min(
    MAX_EXTENSION_YEARS,
    MAX_CONSECUTIVE_YEARS - consecutiveYearsWithTeam
  )
  const prevSalary = contract.salary_by_year[contract.salary_by_year.length - 1]
  const options: ExtensionOption[] = []

  for (let yrs = 1; yrs <= yearsAvailable; yrs++) {
    const salaryByYear = Array.from({ length: yrs }, (_, i) => prevSalary + (i + 1) * 5)
    options.push({
      years: yrs as 1 | 2 | 3,
      salaryByYear,
      totalValue: salaryByYear.reduce((a, b) => a + b, 0),
    })
  }

  return options
}

/**
 * Cut penalty calculation per the rules:
 *  1 year left:  25% of that year's salary
 *  2 years left: 50% of Y1 + 25% of Y2
 *  3 years left: 75% of Y1 + 50% of Y2 + 25% of Y3
 * Penalty reduces draft_cap, not fa_budget.
 */
export function computeCutPenalty(
  contract: Contract,
  activeYear = ACTIVE_YEAR
): CutPenaltyBreakdown | null {
  if (contract.status !== 'active') return null

  const end = contractEndYear(contract)
  const remaining = end - activeYear + 1  // years still to be paid including current
  if (remaining <= 0) return null

  const PENALTY_RATES: Record<number, number[]> = {
    1: [0.25],
    2: [0.50, 0.25],
    3: [0.75, 0.50, 0.25],
  }

  const cappedRemaining = Math.min(remaining, 3)
  const rates = PENALTY_RATES[cappedRemaining]

  const yearlyAmounts = rates.map((rate, i) => {
    const salary = salaryInYear(contract, activeYear + i)
    return Math.round(salary * rate * 100) / 100
  })

  const total = yearlyAmounts.reduce((a, b) => a + b, 0)

  return { yearlyAmounts, total, draftCapImpact: total }
}

/**
 * Aggregates cap usage for a team.
 * `activeContracts` = status 'active' contracts for this team in `activeYear`.
 * `cutPenalties`    = CutPenalty rows with year_applied = activeYear for this team.
 */
export function computeCapSummary(
  activeContracts: Contract[],
  cutPenalties: CutPenalty[],
  draftCapLimit = DRAFT_CAP,
  activeYear = ACTIVE_YEAR
): CapSummary {
  // returning_to_pool contracts don't count against the draft cap
  const capContracts = activeContracts.filter(c => c.status !== 'returning_to_pool')
  const totalActiveSalary = capContracts.reduce(
    (sum, c) => sum + salaryInYear(c, activeYear),
    0
  )
  const totalCutPenalties = cutPenalties.reduce((sum, p) => sum + p.amount, 0)
  const draftCapUsed = totalActiveSalary + totalCutPenalties

  return {
    totalActiveSalary,
    totalCutPenalties,
    drafted: totalActiveSalary,
    draftCapUsed,
    draftCapRemaining: draftCapLimit - draftCapUsed,
    overCap: draftCapUsed > draftCapLimit,
  }
}
