import { useState, useEffect, useRef, useCallback } from 'react'

// Hook to get div dimensions and fire an event when mouse leaves the div
export const useDivMouseObserver = (
  onMouseEnter: () => void,
  onMouseLeave: () => void
) => {
  const ref = useRef<HTMLElement>(null)
  const [dimensions, setDimensions] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  })
  const [isMouseOver, setIsMouseOver] = useState(true)

  // Update dimensions function
  const updateDimensions = useCallback((rect: DOMRect) => {
    const { top, left, bottom, right } = rect
    setDimensions({ top, left, bottom, right })
  }, [])

  useEffect(() => {
    if (!ref.current) {
      return
    }
    // Initialize the Resize Observer with a callback
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const bounds = entry.target.getBoundingClientRect()
        updateDimensions(bounds)
      }
    })
    // Start observing the element
    resizeObserver.observe(ref.current)

    // Initial dimensions update
    if (ref.current) {
      updateDimensions(ref.current.getBoundingClientRect())
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref.current]) // Depend on dimensions to update if div size changes

  // Mouse move event handler
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY } = event
      console.log('Mouse move:', clientX, clientY)
      const { top, left, bottom, right } = dimensions
      const isOver =
        clientX >= left &&
        clientX <= right &&
        clientY >= top &&
        clientY <= bottom
      if (isOver !== isMouseOver) {
        setIsMouseOver(isOver)
      }
    },
    [isMouseOver, dimensions]
  )

  useEffect(() => {
    if (!ref.current) {
      return
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove, ref.current])

  useEffect(() => {
    if (!isMouseOver) {
      console.log('Mouse is leaving the div:', dimensions)
      onMouseLeave()
    } else {
      console.log('Mouse is entering the div:', dimensions)
      onMouseEnter()
    }
  }, [isMouseOver])

  return ref
}
