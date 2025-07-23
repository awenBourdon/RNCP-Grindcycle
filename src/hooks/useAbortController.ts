'use client'
import { useRef, useEffect, useCallback } from 'react'

export const useAbortController = () => {
  const controllersRef = useRef<Set<AbortController>>(new Set())

  const createSignal = useCallback((): AbortSignal => {
    const controller = new AbortController()
    controllersRef.current.add(controller)

    controller.signal.addEventListener('abort', () => {
      controllersRef.current.delete(controller)
    })

    return controller.signal
  }, [])

  const abortAll = useCallback(() => {
    controllersRef.current.forEach(controller => controller.abort())
    controllersRef.current.clear()
  }, [])

  useEffect(() => {
    return () => {
      abortAll()
    }
  }, [abortAll])

  return { createSignal, abortAll }
}
