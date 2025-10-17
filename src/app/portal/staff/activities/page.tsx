'use client'

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Management</h1>
        <p className="text-gray-600 mt-2">
          Assign activities, review submissions, and track student progress
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming in Phase 2</h2>
        <p className="text-gray-600 mb-4">
          Complete LRM (Learning Resource Management) system for activities
        </p>
        <div className="text-sm text-gray-500">
          Planned features:
          <ul className="mt-2 space-y-1">
            <li>• Review student activity submissions</li>
            <li>• Approve/reject with feedback</li>
            <li>• Bulk assign activities to groups</li>
            <li>• Swap AI-assigned activities</li>
            <li>• Set deadlines with email notifications</li>
            <li>• Activity completion tracking</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

