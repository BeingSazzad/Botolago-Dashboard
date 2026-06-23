import type { FixtureStatus, GameweekStatus, ID } from '@/types/common.types'

export interface Fixture {
  id: ID
  gameweek: number
  homeClub: string
  awayClub: string
  homeShort: string
  awayShort: string
  homeScore: number | null
  awayScore: number | null
  kickoff: string
  venue: string
  status: FixtureStatus
  /** Difficulty multiplier applied to player scores for this fixture. */
  homeDifficulty: number
  awayDifficulty: number
}

export interface Gameweek {
  id: ID
  number: number
  name: string
  deadline: string
  status: GameweekStatus
  fixtures: number
  averagePoints: number
  highestPoints: number
  mostCaptained: string
}
