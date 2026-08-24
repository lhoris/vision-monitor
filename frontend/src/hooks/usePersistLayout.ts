import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { saveMyLayout } from '@/store/slices/layoutSlice'
import type { Layout } from '@/types/layout'

const DEFAULT_DEBOUNCE_MS = 500

function snapshotLayout(layout: Layout): string {
  return JSON.stringify({
    activeTab: layout.activeTab,
    tabs: layout.tabs,
  })
}

export function usePersistLayout(debounceMs = DEFAULT_DEBOUNCE_MS) {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((state) => state.layout.layout)
  const username = useAppSelector((state) => state.auth.user?.username)
  const persistStatus = useAppSelector((state) => state.layout.persistStatus)
  const lastSavedSnapshotRef = useRef<string | null>(null)
  const lastAttemptSnapshotRef = useRef<string | null>(null)
  const userRef = useRef<string | undefined>(undefined)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!layout || !username) {
      lastSavedSnapshotRef.current = null
      lastAttemptSnapshotRef.current = null
      userRef.current = username
      return
    }

    const snapshot = snapshotLayout(layout)
    if (userRef.current !== username) {
      userRef.current = username
      lastSavedSnapshotRef.current = snapshot
      lastAttemptSnapshotRef.current = null
      return
    }

    if (lastSavedSnapshotRef.current === null) {
      lastSavedSnapshotRef.current = snapshot
      return
    }

    if (snapshot === lastSavedSnapshotRef.current) {
      return
    }

    if (persistStatus === 'saveFailed' && snapshot === lastAttemptSnapshotRef.current) {
      return
    }

    timerRef.current = window.setTimeout(() => {
      lastAttemptSnapshotRef.current = snapshot
      dispatch(saveMyLayout(layout)).then((action) => {
        if (saveMyLayout.fulfilled.match(action)) {
          lastSavedSnapshotRef.current = snapshot
          lastAttemptSnapshotRef.current = null
        }
      })
    }, debounceMs)

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [debounceMs, dispatch, layout, persistStatus, username])
}

export default usePersistLayout
