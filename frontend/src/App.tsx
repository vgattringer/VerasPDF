import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('unreachable'))
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>VerasPDF</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span>API: {status}</span>
          <Button>Click me</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
