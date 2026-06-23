import type { EntityStatus, ID, MatchStats, Position } from '@/types/common.types'

export interface Player {
  id: ID
  name: string
  club: string
  clubShort: string
  position: Position
  jerseyNumber: number
  nationality: string
  /** In-game transfer price (millions). */
  price: number
  /** Aggregate fantasy points this season. */
  totalPoints: number
  /** Latest computed 0–10 rating. */
  rating: number
  /** Number of fantasy squads that own this player (%). */
  ownership: number
  status: EntityStatus
  avatarUrl?: string
  /** Most recent match stat line (drives the score). */
  lastStats: MatchStats
  createdAt: string
}

export type PlayerFormValues = Omit<
  Player,
  'id' | 'totalPoints' | 'rating' | 'ownership' | 'createdAt'
>
