import { useEffect, useRef, useState } from 'react'

export function usePageResumeToken(): number {
  const [token, setToken] = useState(0)
  const wasInactiveRef = useRef(false)

  useEffect(() => {
    const markInactive = () => {
      wasInactiveRef.current = true
    }

    const refreshIfResumed = () => {
      if (document.visibilityState !== 'visible' || !wasInactiveRef.current) {
        return
      }

      wasInactiveRef.current = false
      setToken((current) => current + 1)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markInactive()
        return
      }

      refreshIfResumed()
    }

    const handlePageShow = () => {
      refreshIfResumed()
    }

    window.addEventListener('blur', markInactive)
    window.addEventListener('focus', refreshIfResumed)
    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('blur', markInactive)
      window.removeEventListener('focus', refreshIfResumed)
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return token
}
