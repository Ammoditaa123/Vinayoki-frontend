interface ProgressBarProps {
  label?: string
  value: number
  showValue?: boolean
  color?: string
}

export function ProgressBar({
  label,
  value,
  showValue = true,
  color = '#00FF7F',
}: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.16em]">
          <span>{label}</span>
          {showValue ? <span>{Math.round(safeValue)}%</span> : null}
        </div>
      ) : null}

      <div className="h-4 w-full overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[inset_0_0_0_2px_#111]">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${safeValue}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
