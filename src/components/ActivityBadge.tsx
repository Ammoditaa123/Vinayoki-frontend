interface ActivityBadgeProps {
  type: 'micro_lesson' | 'quiz' | 'simulation' | 'coding' | 'build' | 'career'
}

const typeStyles: Record<ActivityBadgeProps['type'], string> = {
  micro_lesson: 'bg-[#C0F7FE]',
  quiz: 'bg-[#FFD700]',
  simulation: 'bg-[#00FF7F]',
  coding: 'bg-[#FF6F61]',
  build: 'bg-[#FF4081] text-white',
  career: 'bg-[#4B0082] text-white',
}

export function ActivityBadge({ type }: ActivityBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#111] ${typeStyles[type]}`}
    >
      {type.replace('_', ' ')}
    </span>
  )
}

export default ActivityBadge
