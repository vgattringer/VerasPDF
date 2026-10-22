import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { PdfDropzone } from '@/components/pdf-dropzone'
import { PdfFileList } from '@/components/pdf-file-list'
import { useEstimatedSize } from '@/hooks/use-estimated-size'
import { downloadBlob, mergePdfs } from '@/lib/api'
import { formatSize } from '@/lib/format'

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [imageQuality, setImageQuality] = useState(100)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const newSize = useEstimatedSize(files, imageQuality)
  const newSizeLabel =
    files.length < 2
      ? 'add at least two files'
      : newSize === undefined
        ? 'calculating...'
        : newSize === null
          ? 'unavailable'
          : formatSize(newSize)

  const merge = async () => {
    setBusy(true)
    setError(null)
    try {
      downloadBlob(await mergePdfs(files, imageQuality), 'merged.pdf')
      setFiles([])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Merging failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>VerasPDF - merge PDFs</CardTitle>
          <CardAction className="text-sm text-muted-foreground">
            file size total = {formatSize(totalSize)}
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PdfDropzone onFiles={(added) => setFiles((prev) => [...prev, ...added])} />
          {files.length > 0 && <PdfFileList files={files} onChange={setFiles} />}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span>Image quality</span>
              <span className="text-muted-foreground">
                {imageQuality === 100
                  ? '100 (no size reduction)'
                  : `${imageQuality} - estimated new file size: ${newSizeLabel}`}
              </span>
            </div>
            <Slider
              aria-label="Image quality"
              min={10}
              max={100}
              step={5}
              value={[imageQuality]}
              onValueChange={([value]) => setImageQuality(value)}
            />
          </div>
          {error &&<p className="text-sm text-destructive">{error}</p>}
          <Button disabled={files.length < 2 || busy} onClick={merge}>
            {busy ? 'Merging...' : 'Merge PDFs'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
