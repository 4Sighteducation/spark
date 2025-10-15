'use client'

interface ActivityCardProps {
  activity: any
  assignment: any
  completion: any
  onStart: () => void
}

export default function ActivityCard({ activity, assignment, completion, onStart }: ActivityCardProps) {
  const dimensionColors: Record<string, string> = {
    S: 'from-pink-500 to-pink-600',
    P: 'from-purple-500 to-purple-600',
    A: 'from-cyan-500 to-cyan-600',
    R: 'from-lime-500 to-lime-600',
    K: 'from-yellow-500 to-yellow-600',
  }

  const dimensionIcons: Record<string, string> = {
    S: '🎯',
    P: '🌟',
    A: '🤝',
    R: '💪',
    K: '📚',
  }

  const dimensionNames: Record<string, string> = {
    S: 'Self-Direction',
    P: 'Purpose',
    A: 'Awareness',
    R: 'Resilience',
    K: 'Knowledge',
  }

  const status = completion?.approval_status || 'not_started'
  const isCompleted = status === 'approved'
  const isSubmitted = status === 'submitted'
  const isInProgress = status === 'not_submitted' && completion

  const statusConfig = {
    not_started: {
      label: 'Start Activity',
      color: 'bg-gray-100 text-gray-700',
      badge: '⭕️ Not Started',
    },
    not_submitted: {
      label: 'Continue',
      color: 'bg-blue-100 text-blue-700',
      badge: '🔄 In Progress',
    },
    submitted: {
      label: 'Review Pending',
      color: 'bg-yellow-100 text-yellow-700',
      badge: '⏳ Under Review',
    },
    approved: {
      label: 'Completed!',
      color: 'bg-green-100 text-green-700',
      badge: '✅ Complete',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Color Header */}
      <div className={`h-2 bg-gradient-to-r ${dimensionColors[activity.dimension]}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{dimensionIcons[activity.dimension]}</span>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
              {activity.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full font-medium text-gray-600">
                {dimensionNames[activity.dimension]}
              </span>
              <span className="text-xs text-gray-500">
                ⏱️ {activity.time_minutes} min
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {activity.description}
        </p>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${config.color}`}>
            {config.badge}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          disabled={isCompleted}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold transition-all touch-manipulation min-h-[44px]
            ${isCompleted 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : `bg-gradient-to-r ${dimensionColors[activity.dimension]} text-white hover:opacity-90`
            }
          `}
        >
          {config.label}
        </button>

        {/* Progress indicator if in progress */}
        {isInProgress && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Last active: {new Date(completion.updated_at).toLocaleDateString('en-GB')}
          </div>
        )}
      </div>
    </div>
  )
}

