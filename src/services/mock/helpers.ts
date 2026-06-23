import type { ListResponse } from '@/types/api.types'
import type { QueryParams } from '@/types/common.types'
import { delay } from '@/lib/utils'

/** Wrap a synchronous mock result in the RTK Query `queryFn` shape. */
export async function mockResult<T>(data: T, ms = 300): Promise<{ data: T }> {
  await delay(ms)
  return { data }
}

/** Filter, sort and paginate an in-memory collection like a real list API. */
export function paginate<T>(
  source: T[],
  params: QueryParams = {},
  searchableKeys: (keyof T)[] = [],
): ListResponse<T> {
  const { page = 1, pageSize = 10, search = '', sortBy, sortDir = 'asc' } = params
  const read = (row: T, key: string | number | symbol) =>
    (row as Record<string, unknown>)[key as string]

  let rows = [...source]

  // Free-text search across the provided keys.
  if (search.trim() && searchableKeys.length) {
    const q = search.toLowerCase()
    rows = rows.filter((row) =>
      searchableKeys.some((key) => String(read(row, key) ?? '').toLowerCase().includes(q)),
    )
  }

  // Arbitrary equality filters (any extra param that matches a field).
  const reserved = new Set(['page', 'pageSize', 'search', 'sortBy', 'sortDir'])
  for (const [key, value] of Object.entries(params)) {
    if (reserved.has(key) || value === undefined || value === '' || value === 'all') continue
    if (source[0] && key in (source[0] as object)) {
      rows = rows.filter((row) => String(read(row, key)) === String(value))
    }
  }

  // Sort.
  if (sortBy) {
    rows.sort((a, b) => {
      const av = read(a, sortBy)
      const bv = read(b, sortBy)
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }

  const total = rows.length
  const start = (page - 1) * pageSize
  const items = rows.slice(start, start + pageSize)

  return { items, total, page, pageSize }
}

/** Tiny id generator for newly created mock records. */
let counter = 9000
export function nextId(prefix: string): string {
  counter += 1
  return `${prefix}_${counter}`
}
