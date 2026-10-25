import { useState } from 'react'
import type { DragEvent } from 'react'

function move<T>(items: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= items.length) return items
  const next = [...items]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

export function usePdfFileList(
  files: File[],
  onChange: (files: File[]) => void,
) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const endDrag = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  return {
    dragIndex,
    overIndex,
    onDragStart: (i: number) => setDragIndex(i),
    onDragOver: (e: DragEvent, i: number) => {
      if (dragIndex === null) return
      e.preventDefault()
      setOverIndex(i)
    },
    onDrop: (e: DragEvent, i: number) => {
      e.preventDefault()
      if (dragIndex !== null) onChange(move(files, dragIndex, i))
      endDrag()
    },
    onDragEnd: endDrag,
    moveBy: (i: number, offset: number) => onChange(move(files, i, i + offset)),
    remove: (i: number) => onChange(files.filter((_, j) => j !== i)),
  }
}
