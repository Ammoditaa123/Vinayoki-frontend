import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[6px_6px_0_#111] ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
