import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './pdf-file-list.module.css'
import { usePdfFileList } from './use-pdf-file-list'

interface PdfFileListProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function PdfFileList({ files, onChange }: PdfFileListProps) {
  const {
    dragIndex,
    overIndex,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    moveBy,
    remove,
  } = usePdfFileList(files, onChange)

  return (
    <ul className={styles.list}>
      {files.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          draggable
          onDragStart={() => onDragStart(i)}
          onDragOver={(e) => onDragOver(e, i)}
          onDrop={(e) => onDrop(e, i)}
          onDragEnd={onDragEnd}
          className={cn(
            styles.item,
            dragIndex === i && styles.dragged,
            overIndex === i && dragIndex !== i && styles.over,
          )}
        >
          <GripVertical className={styles.grip} />
          <span className={styles.name}>
            {i + 1}. {file.name}
          </span>
          <button
            aria-label={`Move ${file.name} up`}
            disabled={i === 0}
            className={styles.button}
            onClick={() => moveBy(i, -1)}
          >
            <ArrowUp className={styles.icon} />
          </button>
          <button
            aria-label={`Move ${file.name} down`}
            disabled={i === files.length - 1}
            className={styles.button}
            onClick={() => moveBy(i, 1)}
          >
            <ArrowDown className={styles.icon} />
          </button>
          <button className={styles.button} onClick={() => remove(i)}>
            remove
          </button>
        </li>
      ))}
    </ul>
  )
}
