import { PrintableReport } from '@/components/reports/PrintableReport'
import { Suspense } from 'react'

export default function PrintReportPage({
  searchParams,
}: {
  searchParams: { data?: string }
}) {
  // Report data passed as encoded JSON in URL
  const reportData = searchParams.data 
    ? JSON.parse(decodeURIComponent(searchParams.data))
    : null

  if (!reportData) {
    return (
      <div className="p-8">
        <p>No report data provided</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintableReport 
        name={reportData.name}
        reportData={reportData.scores}
        school={reportData.school}
      />
    </Suspense>
  )
}

