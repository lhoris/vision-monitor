import { useEffect, useState } from 'react'
import { executeMetadataQuery } from '@/services/metadataQueryService'
import type { MetadataPollingState, MetadataQueryError, MetadataQueryResult, MetadataSectionConfig } from '@/types/metadataConfig'

function initialStateFor(section: MetadataSectionConfig): MetadataPollingState {
  if (!section.queryId) return { status: 'success', result: null, error: null }
  return { status: 'loading', result: null, error: null }
}

export function useMetadataPolling(section: MetadataSectionConfig, sourceId: string, active = true): MetadataPollingState {
  const [state, setState] = useState<MetadataPollingState>(() => initialStateFor(section))

  useEffect(() => {
    let disposed = false
    let timer: number | undefined
    let inFlight = false
    let requestController: AbortController | null = null
    let previousResult: MetadataQueryResult | null = null

    if (!section.queryId) {
      setState({ status: 'success', result: null, error: null })
      return () => { disposed = true }
    }

    const fetchData = async () => {
      if (disposed || inFlight || !active || !section.visible) return
      const queryId = section.queryId
      if (!queryId) return
      inFlight = true
      const controller = new AbortController()
      requestController = controller
      setState((current) => ({ status: current.result ? 'stale' : 'loading', result: current.result, error: null }))
      try {
        const result = await executeMetadataQuery({ queryId, sourceId, signal: controller.signal })
        if (disposed) return
        previousResult = result
        setState({ status: result.rows.length ? 'success' : 'empty', result, error: null })
      } catch (error) {
        if (disposed || (error instanceof DOMException && error.name === 'AbortError')) return
        const queryError = error as MetadataQueryError
        setState({ status: previousResult ? 'stale' : 'error', result: previousResult, error: { code: queryError.code ?? 'QUERY_FAILED', message: queryError.message ?? 'Query 조회에 실패했습니다.', queryId } })
      } finally {
        if (requestController === controller) requestController = null
        inFlight = false
      }
    }

    if (active && section.visible) {
      void fetchData()
      timer = window.setInterval(() => void fetchData(), section.refreshIntervalSec * 1000)
    }
    return () => {
      disposed = true
      if (timer !== undefined) window.clearInterval(timer)
      requestController?.abort()
      requestController = null
    }
  }, [active, section.id, section.queryId, section.refreshIntervalSec, section.visible, sourceId])

  return state
}
