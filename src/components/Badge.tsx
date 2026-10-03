import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'sky' | 'yellow' | 'mint' | 'pink' | 'lavender' | 'white'
  className?: string
}

const toneMap = {
  sky: 'bg-[#C0F7FE]',
  yellow: 'bg-[#FFD700]',
  mint: 'bg-[#00FF7F]',
  pink: 'bg-[#FF4081]',
  lavender: 'bg-[#4B0082] text-white',
  white: 'bg-white',
}

export function Badge({ children, tone = 'yellow', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_#111] ${toneMap[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
