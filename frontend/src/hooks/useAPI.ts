/**
 * Custom Hook for API Error Handling & Loading State
 * API 요청에 대한 에러 처리 및 로딩 상태 관리
 */

import { useCallback, useState } from 'react'
import type { AxiosError } from 'axios'

interface UseAPIOptions {
  retries?: number
  onError?: (error: Error | AxiosError) => void
  onSuccess?: () => void
}

interface APIState {
  loading: boolean
  error: string | null
  retryCount: number
}

/**
 * API 호출 시 에러 처리, 재시도, 로딩 상태를 관리하는 훅
 */
export function useAPI(options?: UseAPIOptions) {
  const { retries = 3, onError, onSuccess } = options || {}
  const [state, setState] = useState<APIState>({
    loading: false,
    error: null,
    retryCount: 0,
  })

  /**
   * API 요청 실행
   */
  const request = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        setState({ loading: true, error: null, retryCount: 0 })
        const result = await asyncFn()
        setState({ loading: false, error: null, retryCount: 0 })
        onSuccess?.()
        return result
      } catch (error) {
        const apiError = error instanceof Error ? error : new Error(String(error))
        setState((prev) => ({
          ...prev,
          loading: false,
          error: apiError.message,
        }))
        onError?.(error as Error | AxiosError)
        return null
      }
    },
    [onError, onSuccess]
  )

  /**
   * 재시도 로직이 있는 API 요청
   */
  const requestWithRetry = useCallback(
    async <T,>(asyncFn: () => Promise<T>, maxRetries: number = retries): Promise<T | null> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setState({ loading: true, error: null, retryCount: attempt })
          const result = await asyncFn()
          setState({ loading: false, error: null, retryCount: 0 })
          onSuccess?.()
          return result
        } catch (error) {
          if (attempt === maxRetries) {
            const apiError = error instanceof Error ? error : new Error(String(error))
            setState((prev) => ({
              ...prev,
              loading: false,
              error: apiError.message,
            }))
            onError?.(error as Error | AxiosError)
            return null
          }
          // exponential backoff
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000)
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
      return null
    },
    [retries, onError, onSuccess]
  )

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }, [])

  /**
   * 로딩 상태 초기화
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      retryCount: 0,
    })
  }, [])

  return {
    ...state,
    request,
    requestWithRetry,
    clearError,
    reset,
  }
}

/**
 * 폼 제출 또는 단일 버튼 클릭 액션에 사용할 간단한 로딩/에러 상태 훅
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFn()
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setLoading(false)
      return null
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    loading,
    error,
    execute,
    clearError,
    reset,
  }
}

/**
 * 조건부 재시도 로직이 있는 API 요청 훅
 */
export function useRetryableAPI(options?: UseAPIOptions & { shouldRetry?: (error: Error) => boolean }) {
  const { shouldRetry, ...apiOptions } = options || {}
  const { request, requestWithRetry, ...apiState } = useAPI(apiOptions)

  /**
   * 재시도 조건을 체크하는 함수를 사용한 재시도
   */
  const retryableRequest = useCallback(
    async <T,>(asyncFn: () => Promise<T>, maxRetries: number = 3): Promise<T | null> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await asyncFn()
        } catch (error) {
          const shouldContinue = shouldRetry?.(error instanceof Error ? error : new Error(String(error)))
          if (!shouldContinue || attempt === maxRetries) {
            throw error
          }
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000)
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
      return null
    },
    [shouldRetry]
  )

  return {
    ...apiState,
    request,
    requestWithRetry,
    retryableRequest,
  }
}
