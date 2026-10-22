import { useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PdfFileListProps {
  files: File[]
  onChange: (files: File[]) => void
}

function move<T>(items: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= items.length) return items
  const next = [...items]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

export function PdfFileList({ files, onChange }: PdfFileListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const endDrag = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <ul className="flex flex-col gap-1 text-sm">
      {files.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => {
            if (dragIndex === null) return
            e.preventDefault()
            setOverIndex(i)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (dragIndex !== null) onChange(move(files, dragIndex, i))
            endDrag()
          }}
          onDragEnd={endDrag}
          className={cn(
            'flex items-center gap-2 rounded-md border px-2 py-1',
            dragIndex === i && 'opacity-50',
            overIndex === i && dragIndex !== i && 'border-primary',
          )}
        >
          <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">
            {i + 1}. {file.name}
          </span>
          <button
            aria-label={`Move ${file.name} up`}
            disabled={i === 0}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            onClick={() => onChange(move(files, i, i - 1))}
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            aria-label={`Move ${file.name} down`}
            disabled={i === files.length - 1}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            onClick={() => onChange(move(files, i, i + 1))}
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onChange(files.filter((_, j) => j !== i))}
          >
            remove
          </button>
        </li>
      ))}
    </ul>
  )
}
