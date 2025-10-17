'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage organization settings and preferences
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          Organization and assessment cycle management
        </p>
        <div className="text-sm text-gray-500">
          Planned features:
          <ul className="mt-2 space-y-1">
            <li>• Manage assessment cycles</li>
            <li>• Organization profile settings</li>
            <li>• Staff role management</li>
            <li>• Email notification preferences</li>
            <li>• Data export options</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

