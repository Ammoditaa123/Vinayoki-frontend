import { BrainCircuit } from 'lucide-react'
import type { NormalizedLearningCard } from '../types'

interface RecommendationReasonProps {
  card: NormalizedLearningCard
}

export function RecommendationReason({ card }: RecommendationReasonProps) {
  // Generate human-friendly UX labels based on opaque ML scores + card metadata
  // DO NOT show exact `recommendationScore` or `completionProbability` to users.

  const labels: string[] = []

  // Score-based labels
  if (card.recommendationScore >= 0.9) {
    labels.push('Top pick for you')
  } else if (card.recommendationScore >= 0.7) {
    labels.push('Highly recommended')
  } else if (card.recommendationScore >= 0.5) {
    labels.push('Good next step')
  } else {
    labels.push('Explore a new skill')
  }

  // Content-based labels
  if (card.stepTypes?.includes('build')) {
    labels.push('Build-focused')
  }
  
  if (card.difficulty === 1) {
    labels.push('Foundation building')
  } else if (card.difficulty >= 3) {
    labels.push('Challenge yourself')
  }

  // Deduplicate and limit to top 3 reasons
  const uniqueLabels = Array.from(new Set(labels)).slice(0, 3)

  return (
    <div>
      <p className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#333333]">
        <BrainCircuit size={14} /> Why this?
      </p>
      <ul className="flex flex-wrap gap-2 text-xs font-bold text-[#222222]">
        {uniqueLabels.map((label) => (
          <li key={label} className="rounded-full border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_#111]">
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RecommendationReason
