import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PdfDropzone } from '@/components/pdf-dropzone'
import { PdfFileList } from '@/components/pdf-file-list'
import { downloadBlob, mergePdfs } from '@/lib/api'

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [reduceSize, setReduceSize] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const merge = async () => {
    setBusy(true)
    setError(null)
    try {
      downloadBlob(await mergePdfs(files, reduceSize), 'merged.pdf')
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
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PdfDropzone onFiles={(added) => setFiles((prev) => [...prev, ...added])} />
          {files.length > 0 && <PdfFileList files={files} onChange={setFiles} />}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reduceSize}
              onChange={(e) => setReduceSize(e.target.checked)}
            />
            Reduce file size
          </label>
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
