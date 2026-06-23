import { useState } from 'react'
import { Calculator, BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PositionBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { POSITIONS, POSITION_OPTIONS } from '@/lib/constants'
import {
  SCORING_WEIGHTS,
  EMPTY_STATS,
  DEFAULT_NORMALIZATION,
  DIFFICULTY_PRESETS,
  MINUTES_UNIT,
  computeRating,
} from '@/lib/scoring'
import { round } from '@/lib/utils'
import type { MatchStats, Position } from '@/types/common.types'

const DIFFICULTY_SELECT_OPTIONS = DIFFICULTY_PRESETS.map((p) => ({
  label: p.label,
  value: String(p.value),
}))

const POSITION_SELECT_OPTIONS = POSITION_OPTIONS.map((p) => ({
  label: p.label,
  value: p.value as string,
}))

const TAB_ITEMS = [
  { value: 'calculator', label: 'Calculator', icon: <Calculator className="h-4 w-4" /> },
  { value: 'rules', label: 'Scoring Rules', icon: <BookOpen className="h-4 w-4" /> },
]

function ScoreRing({ value }: { value: number }) {
  const color =
    value >= 7 ? 'text-emerald-600' : value >= 4 ? 'text-amber-600' : 'text-rose-500'
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-6xl font-extrabold tabular-nums leading-none tracking-tight ${color}`}>
        {value.toFixed(2)}
      </span>
      <span className="text-sm font-medium text-slate-400">out of 10</span>
    </div>
  )
}

function MetaBlock({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
    </div>
  )
}

export function ScoringPage() {
  const [tab, setTab] = useState('calculator')
  const [position, setPosition] = useState<Position>('Forward')
  const [stats, setStats] = useState<MatchStats>({ ...EMPTY_STATS })
  const [bonus, setBonus] = useState(0)
  const [difficulty, setDifficulty] = useState(1)
  const [normalization, setNormalization] = useState(DEFAULT_NORMALIZATION)

  const weights = SCORING_WEIGHTS[position]
  const relevantKeys = new Set(weights.map((w) => w.key))

  const { baseScore, finalRating, scoreOutOf10 } = computeRating(position, stats, {
    bonus,
    difficulty,
    normalization,
  })

  function handleStatChange(key: keyof MatchStats, raw: string) {
    const parsed = parseFloat(raw)
    setStats((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }))
  }

  function handlePositionChange(val: string) {
    setPosition(val as Position)
    setStats({ ...EMPTY_STATS })
  }

  const progressColor =
    scoreOutOf10 >= 7
      ? 'bg-emerald-500'
      : scoreOutOf10 >= 4
        ? 'bg-amber-400'
        : 'bg-rose-500'

  return (
    <div>
      <PageHeader
        title="Scoring Engine"
        description="Configure and preview how player performances convert to fantasy points."
      />

      <Tabs tabs={TAB_ITEMS} value={tab} onChange={setTab} className="mb-6" />

      {/* ── TAB 1: Calculator ──────────────────────────────────────────────── */}
      {tab === 'calculator' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Controls — left side spans 2 cols on lg */}
          <div className="space-y-6 lg:col-span-2">
            {/* Position + modifiers */}
            <Card>
              <CardHeader title="Match Parameters" description="Select position and match modifiers." />
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Select
                    label="Position"
                    name="position"
                    options={POSITION_SELECT_OPTIONS}
                    value={position}
                    onChange={(e) => handlePositionChange(e.target.value)}
                  />
                  <Input
                    label="Bonus Points"
                    name="bonus"
                    type="number"
                    min={0}
                    max={3}
                    step={1}
                    value={bonus}
                    onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
                    hint="Top-performer bonus (0–3)"
                  />
                  <Select
                    label="Fixture Difficulty"
                    name="difficulty"
                    options={DIFFICULTY_SELECT_OPTIONS}
                    value={String(difficulty)}
                    onChange={(e) => setDifficulty(parseFloat(e.target.value))}
                  />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Normalisation (N)"
                    name="normalization"
                    type="number"
                    min={1}
                    step={1}
                    value={normalization}
                    onChange={(e) =>
                      setNormalization(Math.max(1, parseFloat(e.target.value) || DEFAULT_NORMALIZATION))
                    }
                    hint={`Default: ${DEFAULT_NORMALIZATION}`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stat inputs */}
            <Card>
              <CardHeader
                title="Stat Line"
                description={`Enter the match statistics for a ${position}.`}
              />
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {weights.map(({ key, label }) => (
                    <Input
                      key={key}
                      label={key === 'M' ? `${label} (mins)` : label}
                      name={key}
                      type="number"
                      min={0}
                      step={key === 'M' ? 1 : 1}
                      value={relevantKeys.has(key) ? stats[key] : 0}
                      onChange={(e) => handleStatChange(key, e.target.value)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contribution breakdown table */}
            <Card>
              <CardHeader
                title="Score Breakdown"
                description="How each stat contributes to the base score."
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Stat
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Value
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Weight
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {weights.map(({ key, label, weight }) => {
                      const isMinutes = key === 'M'
                      const rawValue = stats[key]
                      const contribution = isMinutes
                        ? round((rawValue / MINUTES_UNIT) * weight, 3)
                        : round(rawValue * weight, 3)
                      const isNeg = contribution < 0
                      const isPos = contribution > 0
                      const displayValue = isMinutes ? `${rawValue}'` : String(rawValue)

                      return (
                        <tr key={key} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 font-medium text-slate-700">
                            <span className="inline-flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-400">{key}</span>
                              {label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-slate-600">
                            {displayValue}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums">
                            <span
                              className={
                                weight < 0
                                  ? 'text-rose-600 font-medium'
                                  : 'text-slate-600 font-medium'
                              }
                            >
                              {weight > 0 ? `+${weight}` : weight}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums font-semibold">
                            <span
                              className={
                                isNeg
                                  ? 'text-rose-600'
                                  : isPos
                                    ? 'text-emerald-600'
                                    : 'text-slate-400'
                              }
                            >
                              {contribution > 0 ? `+${contribution}` : contribution}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td
                        colSpan={3}
                        className="px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        Base Score Total
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-bold text-slate-900 tabular-nums">
                        {baseScore}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>

          {/* Results panel — right col */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card>
                <CardHeader title="Fantasy Rating" description="Live result from the scoring engine." />
                <CardContent className="space-y-5">
                  {/* Big score */}
                  <div className="flex flex-col items-center gap-4 py-4">
                    <ScoreRing value={scoreOutOf10} />
                    <ProgressBar
                      value={scoreOutOf10 * 10}
                      barClassName={progressColor}
                      className="h-3"
                    />
                  </div>

                  {/* Three meta blocks */}
                  <div className="grid grid-cols-1 gap-3">
                    <MetaBlock label="Base Score" value={String(baseScore)} />
                    <MetaBlock
                      label={`Base (${baseScore}) + Bonus (${bonus}) × Difficulty (${difficulty}×)`}
                      value={`= ${finalRating} pts`}
                    />
                    <MetaBlock
                      label={`Normalised ÷ ${normalization} × 10`}
                      value={`${scoreOutOf10} / 10`}
                    />
                  </div>

                  {/* Position tag */}
                  <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400">Scoring as</span>
                    <PositionBadge position={position} />
                  </div>
                </CardContent>
              </Card>

              {/* Quick guide */}
              <Card>
                <CardContent className="space-y-2 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Pipeline
                  </p>
                  <ol className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold">
                        1
                      </span>
                      Sum weighted stats (minutes per 30)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold">
                        2
                      </span>
                      Add bonus, multiply by difficulty
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold">
                        3
                      </span>
                      Normalise to 0–10 scale (÷ N × 10)
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Scoring Rules ───────────────────────────────────────────── */}
      {tab === 'rules' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-primary-100 bg-primary-50 px-5 py-4">
            <p className="text-sm text-primary-800">
              <span className="font-semibold">How ratings work:</span> Each stat is multiplied by
              its position-specific weight to build a base score. A top-performer bonus and a
              fixture difficulty multiplier are then applied. The result is normalised to a{' '}
              <strong>0–10 scale</strong> by dividing by N&nbsp;(default {DEFAULT_NORMALIZATION})
              and multiplying by 10. Minutes are scored per {MINUTES_UNIT}-minute block.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {POSITIONS.map((pos) => (
              <Card key={pos}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      {pos}
                      <PositionBadge position={pos} />
                    </span>
                  }
                  description={`Fantasy points weights for ${pos.toLowerCase()}s`}
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Stat
                        </th>
                        <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {SCORING_WEIGHTS[pos].map(({ key, label, weight }) => {
                        const isNeg = weight < 0
                        return (
                          <tr key={key} className="hover:bg-slate-50/50">
                            <td className="px-5 py-2.5 text-slate-700">
                              <span className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-400">{key}</span>
                                {label}
                                {key === 'M' && (
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                                    per {MINUTES_UNIT} min
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-right">
                              <span
                                className={
                                  isNeg
                                    ? 'font-semibold text-rose-600'
                                    : 'font-semibold text-emerald-700'
                                }
                              >
                                {weight > 0 ? `+${weight}` : weight}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
