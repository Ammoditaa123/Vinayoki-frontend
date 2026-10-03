import { motion } from 'framer-motion'
import { ArrowRight, Eye, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { NormalizedStep } from '../types'

interface WatchStepProps {
  step: NormalizedStep
  onComplete: (timeSpent: number) => void
}

export default function WatchStep({ step, onComplete }: WatchStepProps) {
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-[#C0F7FE] px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] shadow-[3px_3px_0_#111]">
          <Eye size={16} /> Watch
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold text-[#555]">
          <Timer size={16} />
          {String(Math.floor(timeSpent / 60)).padStart(2, '0')}:
          {String(timeSpent % 60).padStart(2, '0')}
        </span>
      </div>

      <div className="flex-1">
        <h2 className="text-3xl font-black uppercase leading-tight sm:text-4xl">{step.title}</h2>
        {step.content ? (
          <div className="mt-6 rounded-[24px] border-[3px] border-black bg-white p-6 text-lg font-medium leading-relaxed text-[#222] shadow-[6px_6px_0_#111]">
            <p>{step.content}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => onComplete(timeSpent)}
          className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FFD700] px-8 py-4 text-lg font-black uppercase shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
        >
          Got it <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  )
}
