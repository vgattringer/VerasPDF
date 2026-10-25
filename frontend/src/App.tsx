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
import styles from './App.module.css'
import { useApp } from './use-app'

function App() {
  const {
    files,
    setFiles,
    addFiles,
    clearFiles,
    imageQuality,
    setImageQuality,
    totalSize,
  } = useApp()

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>VerasPDF - merge PDFs</CardTitle>
          <CardAction className={styles.total}>
            file size total = {formatSize(totalSize)}
          </CardAction>
        </CardHeader>
        <CardContent className={styles.content}>
          <PdfDropzone onFiles={addFiles} />
          {files.length > 0 && <PdfFileList files={files} onChange={setFiles} />}
          <QualitySlider
            files={files}
            value={imageQuality}
            onChange={setImageQuality}
          />
          <MergeButton
            files={files}
            imageQuality={imageQuality}
            onMerged={clearFiles}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default App
