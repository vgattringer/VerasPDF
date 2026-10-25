import { useState } from 'react'

export function useApp() {
  const [files, setFiles] = useState<File[]>([])
  const [imageQuality, setImageQuality] = useState(100)
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  const addFiles = (added: File[]) => setFiles((prev) => [...prev, ...added])
  const clearFiles = () => setFiles([])

  return {
    files,
    setFiles,
    addFiles,
    clearFiles,
    imageQuality,
    setImageQuality,
    totalSize,
  }
}
