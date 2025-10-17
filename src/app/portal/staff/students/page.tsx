'use client'

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-2">
          Bulk import, export, and manage student accounts
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          Student import/export and account management features will be added in the next phase
        </p>
        <div className="text-sm text-gray-500">
          Planned features:
          <ul className="mt-2 space-y-1">
            <li>• Bulk CSV student import</li>
            <li>• Export student data</li>
            <li>• Manage student accounts</li>
            <li>• Class/group assignments</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

