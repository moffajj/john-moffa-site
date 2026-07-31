export type Role = 'manager' | 'commissioner'
export type Origin = 'free_agent' | 'extension'
export type ContractStatus = 'active' | 'expired' | 'cut' | 'returning_to_pool'
export type AcquisitionType = 'Drafted' | 'Free Agent' | 'Trade' | 'Under Contract'
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | string

export interface AppUser {
  id: string
  email: string
  role: Role
}

export interface Team {
  id: string
  user_id: string | null
  name: string
  team_code: string
  draft_cap: number
  fa_budget: number
}

export interface Player {
  id: string
  name: string
  position: Position
  nfl_team: string
}

export interface Contract {
  id: string
  player_id: string
  team_id: string
  start_year: number
  length: number
  salary_by_year: number[]
  origin: Origin
  status: ContractStatus
  extension_eligible: boolean
  extended_from_contract_id: string | null
  acquisition_type: AcquisitionType | null
  created_at: string
}

export interface CutPenalty {
  id: string
  contract_id: string | null
  team_id: string
  year_applied: number
  amount: number
  player_name: string | null
}

export interface TeamHistory {
  id: string
  player_id: string
  team_id: string
  year_start: number
  year_end: number | null
}

// Joined / computed types used in the UI
export interface ContractWithPlayer extends Contract {
  players: Player
}

export interface RosterEntry {
  contract: Contract
  player: Player
  /** Salary owed in `activeYear` from this contract */
  currentSalary: number
  /** Remaining years as of start of activeYear */
  yearsRemaining: number
  extensionEligible: boolean
  extensionOptions: ExtensionOption[]
  cutPenalty: CutPenaltyBreakdown | null
}

export interface ExtensionOption {
  years: 1 | 2 | 3
  salaryByYear: number[]
  totalValue: number
}

export interface CutPenaltyBreakdown {
  yearlyAmounts: number[]    // penalty per remaining year
  total: number
  draftCapImpact: number     // same as total — reduces draft_cap
}

export interface CapSummary {
  totalActiveSalary: number
  totalCutPenalties: number
  drafted: number            // active salaries that count against draft_cap
  draftCapUsed: number       // drafted + cut penalties
  draftCapRemaining: number
  overCap: boolean
}
