interface RecommendationReasonProps {
  reasons: string[]
}

export function RecommendationReason({ reasons }: RecommendationReasonProps) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em]">Why this?</p>
      <ul className="flex flex-wrap gap-2 text-xs font-bold text-[#222222]">
        {reasons.map((reason) => (
          <li key={reason} className="rounded-full border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_#111]">
            {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RecommendationReason
