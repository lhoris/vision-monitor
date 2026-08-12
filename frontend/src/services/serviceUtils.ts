import type { ApiResponse } from '@/types/api'

export function getResponseData<T>(response: ApiResponse<T>, fallback: T): T {
  return response.data || fallback
}

export async function withServiceFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(errorMessage, error)
    return fallback
  }
}
