import type { EntityStatus, ID, Position } from '@/types/common.types'

export interface User {
  id: ID
  name: string
  email: string
  username: string
  teamName: string
  country: string
  status: EntityStatus
  /** Overall fantasy points. */
  totalPoints: number
  /** Global rank. */
  rank: number
  /** Mini-leagues joined. */
  leagues: number
  avatarUrl?: string
  joinedAt: string
  lastActiveAt: string
}

export interface FantasyTeam {
  id: ID
  ownerId: ID
  ownerName: string
  teamName: string
  formation: string
  budget: number
  squadValue: number
  points: number
  gwPoints: number
  rank: number
}

/** A single slot in a fantasy squad (drives the team detail view). */
export interface SquadPlayer {
  id: ID
  name: string
  club: string
  clubShort: string
  position: Position
  isStarting: boolean
  isCaptain: boolean
  isViceCaptain: boolean
  /** Points scored this gameweek (captain already doubled). */
  gwPoints: number
  rating: number
}

/** Full team detail returned when an admin opens a team. */
export interface FantasyTeamDetail extends FantasyTeam {
  squad: SquadPlayer[]
  chipsUsed: string[]
  totalTransfers: number
  joinedLeagues: number
  ownerEmail: string
  ownerCountry: string
}
