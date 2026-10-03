interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ value, size = 110, strokeWidth = 12 }: ProgressRingProps) {
  const safeValue = Math.max(0, Math.min(value, 100))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (safeValue / 100) * circumference

  return (
    <svg width={size} height={size} className="overflow-visible">
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        stroke="#111111"
        strokeWidth={strokeWidth}
        opacity={0.2}
      />
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        stroke="#00FF7F"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-black text-[14px] font-black"
      >
        {Math.round(safeValue)}%
      </text>
    </svg>
  )
}

export default ProgressRing
