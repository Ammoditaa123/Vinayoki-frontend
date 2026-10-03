interface StatCardProps {
  value: string
  label: string
  accent?: 'yellow' | 'sky' | 'mint' | 'coral'
}

const accentMap = {
  yellow: 'bg-[#FFD700]',
  sky: 'bg-[#C0F7FE]',
  mint: 'bg-[#00FF7F]',
  coral: 'bg-[#FF6F61]',
}

export function StatCard({ value, label, accent = 'yellow' }: StatCardProps) {
  return (
    <div className={`rounded-[24px] border-[3px] border-black p-5 shadow-[5px_5px_0_#111] ${accentMap[accent]}`}>
      <p className="text-4xl font-black uppercase tracking-[-0.05em]">{value}</p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em]">{label}</p>
    </div>
  )
}

export default StatCard
