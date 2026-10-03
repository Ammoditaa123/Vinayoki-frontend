import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'ghost'

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#FF6F61] text-black',
  secondary: 'bg-[#C0F7FE] text-black',
  success: 'bg-[#00FF7F] text-black',
  warning: 'bg-[#FFD700] text-black',
  ghost: 'bg-white text-black',
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      className={`inline-flex items-center justify-center rounded-[18px] border-[3px] border-black px-5 py-3 text-sm font-black uppercase tracking-[0.12em] shadow-[4px_4px_0_#111] transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button
