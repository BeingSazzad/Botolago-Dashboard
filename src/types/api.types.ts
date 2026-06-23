/** Generic API envelope types shared by all RTK Query endpoints. */

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  status: number
  message: string
  fields?: Record<string, string>
}

export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
