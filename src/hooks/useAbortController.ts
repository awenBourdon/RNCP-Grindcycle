'use client'
import { useRef, useEffect } from 'react'

export const useAbortController = () => {
  const controllersRef = useRef<Set<AbortController>>(new Set())

  const createSignal = () => {
    const controller = new AbortController()
    controllersRef.current.add(controller)
    return controller.signal
  }

  const abortAll = () => {
    controllersRef.current.forEach(controller => controller.abort())
    controllersRef.current.clear()
  }

  useEffect(() => {
    return () => {
      abortAll()
    }
  }, [])

  return { createSignal, abortAll }
}