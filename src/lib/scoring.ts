import type { MatchStats, Position } from '@/types/common.types'
import { clamp, round } from './utils'

/**
 * Fantasy scoring engine — TypeScript port of the reference Python model.
 *
 * Pipeline:  base score (position-weighted)  ->  + bonus, × difficulty
 *            ->  normalised to a 0–10 rating.
 *
 * Weights are exposed (SCORING_WEIGHTS) so the admin "Scoring" screen can
 * render the rule table and the live calculator from a single source of truth.
 */

export interface StatWeight {
  key: keyof MatchStats
  label: string
  /** Per-position multiplier; 0 means the stat does not score for that position. */
  weight: number
}

/** Minutes are scored in "units of 30 minutes" for every position. */
export const MINUTES_UNIT = 30

/** Default normalisation constant (theoretical strong performance). */
export const DEFAULT_NORMALIZATION = 30

/** Difficulty multiplier presets surfaced in the UI. */
export const DIFFICULTY_PRESETS: { label: string; value: number }[] = [
  { label: 'Very Easy (0.8×)', value: 0.8 },
  { label: 'Easy (0.9×)', value: 0.9 },
  { label: 'Neutral (1.0×)', value: 1.0 },
  { label: 'Hard (1.1×)', value: 1.1 },
  { label: 'Very Hard (1.2×)', value: 1.2 },
]

/**
 * Per-position weight tables. Mirrors the reference model exactly.
 * Negative weights (cards / own goals) are shared across positions.
 */
export const SCORING_WEIGHTS: Record<Position, StatWeight[]> = {
  Forward: [
    { key: 'G', label: 'Goal', weight: 6 },
    { key: 'A', label: 'Assist', weight: 4 },
    { key: 'CS', label: 'Clean Sheet', weight: 1 },
    { key: 'SoT', label: 'Shot on Target', weight: 1 },
    { key: 'M', label: 'Minutes (per 30)', weight: 1 },
    { key: 'YC', label: 'Yellow Card', weight: -1 },
    { key: 'RC', label: 'Red Card', weight: -3 },
    { key: 'OG', label: 'Own Goal', weight: -2 },
  ],
  Midfielder: [
    { key: 'G', label: 'Goal', weight: 5 },
    { key: 'A', label: 'Assist', weight: 5 },
    { key: 'CS', label: 'Clean Sheet', weight: 2 },
    { key: 'SoT', label: 'Shot on Target', weight: 0.5 },
    { key: 'T', label: 'Tackle', weight: 0.5 },
    { key: 'M', label: 'Minutes (per 30)', weight: 1 },
    { key: 'YC', label: 'Yellow Card', weight: -1 },
    { key: 'RC', label: 'Red Card', weight: -3 },
    { key: 'OG', label: 'Own Goal', weight: -2 },
  ],
  Defender: [
    { key: 'G', label: 'Goal', weight: 6 },
    { key: 'A', label: 'Assist', weight: 3 },
    { key: 'CS', label: 'Clean Sheet', weight: 4 },
    { key: 'T', label: 'Tackle', weight: 1 },
    { key: 'M', label: 'Minutes (per 30)', weight: 1 },
    { key: 'YC', label: 'Yellow Card', weight: -1 },
    { key: 'RC', label: 'Red Card', weight: -3 },
    { key: 'OG', label: 'Own Goal', weight: -2 },
  ],
  Goalkeeper: [
    { key: 'G', label: 'Goal', weight: 8 },
    { key: 'A', label: 'Assist', weight: 3 },
    { key: 'CS', label: 'Clean Sheet', weight: 5 },
    { key: 'S', label: 'Save', weight: 1 },
    { key: 'T', label: 'Tackle', weight: 0.5 },
    { key: 'M', label: 'Minutes (per 30)', weight: 1 },
    { key: 'YC', label: 'Yellow Card', weight: -1 },
    { key: 'RC', label: 'Red Card', weight: -3 },
    { key: 'OG', label: 'Own Goal', weight: -2 },
  ],
}

export const EMPTY_STATS: MatchStats = {
  G: 0,
  A: 0,
  CS: 0,
  SoT: 0,
  T: 0,
  S: 0,
  M: 0,
  YC: 0,
  RC: 0,
  OG: 0,
}

/**
 * Base score for a player given their position and a match stat line.
 * Minutes are converted to units of 30, matching the reference model.
 */
export function calculateBaseScore(position: Position, stats: Partial<MatchStats>): number {
  const s: MatchStats = { ...EMPTY_STATS, ...stats }
  const minutesUnits = s.M / MINUTES_UNIT

  const weights = SCORING_WEIGHTS[position]
  let total = 0
  for (const { key, weight } of weights) {
    if (key === 'M') {
      total += minutesUnits * weight
      continue
    }
    total += (s[key] ?? 0) * weight
  }
  return round(total, 3)
}

/** Apply top-performer bonus and the opponent difficulty multiplier. */
export function applyBonusAndDifficulty(baseScore: number, bonus = 0, difficulty = 1): number {
  return round((baseScore + bonus) * difficulty, 3)
}

/** Normalise the final rating to a clamped 0–10 scale. */
export function normalizeRating(finalRating: number, normalization = DEFAULT_NORMALIZATION): number {
  const out = (finalRating / normalization) * 10
  return round(clamp(out, 0, 10), 2)
}

export interface RatingBreakdown {
  baseScore: number
  finalRating: number
  scoreOutOf10: number
}

/** Run the full pipeline in one call. */
export function computeRating(
  position: Position,
  stats: Partial<MatchStats>,
  options: { bonus?: number; difficulty?: number; normalization?: number } = {},
): RatingBreakdown {
  const { bonus = 0, difficulty = 1, normalization = DEFAULT_NORMALIZATION } = options
  const baseScore = calculateBaseScore(position, stats)
  const finalRating = applyBonusAndDifficulty(baseScore, bonus, difficulty)
  const scoreOutOf10 = normalizeRating(finalRating, normalization)
  return { baseScore, finalRating, scoreOutOf10 }
}
