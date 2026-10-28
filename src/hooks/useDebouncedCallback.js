import { useRef, useCallback, useEffect } from "react"

/**
 * Creates a debounced version of a callback function
 * @param {Function} callback - The callback to execute after the delay
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} The debounced function
 */
export const useDebouncedCallback = (callback, delay = 3000) => {
  const callbackRef = useRef(callback)
  const timerRef = useRef(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )
}
