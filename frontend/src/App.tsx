import { useState } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MergeButton, PdfDropzone, PdfFileList } from '@/features/merge'
import { QualitySlider } from '@/features/size-reduction'
import { formatSize } from '@/lib/format'

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [imageQuality, setImageQuality] = useState(100)
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

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
          <QualitySlider
            files={files}
            value={imageQuality}
            onChange={setImageQuality}
          />
          <MergeButton
            files={files}
            imageQuality={imageQuality}
            onMerged={() => setFiles([])}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default App
