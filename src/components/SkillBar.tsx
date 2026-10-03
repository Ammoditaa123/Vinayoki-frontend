interface SkillBarProps {
  skill: string
  score: number
  label?: string
}

export function SkillBar({ skill, score, label }: SkillBarProps) {
  const safeScore = Math.max(0, Math.min(score, 100))

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.16em]">
        <span>{label ?? skill}</span>
        <span>{Math.round(safeScore)}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full border-[3px] border-black bg-white">
        <div
          className="h-full bg-[#00FF7F] transition-all duration-300"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  )
}

export default SkillBar
