import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, TestTube2, Timer, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { NormalizedStep } from '../types'

interface SolveStepProps {
  step: NormalizedStep
  onComplete: (correct: boolean, timeSpent: number) => void
}

export default function SolveStep({ step, onComplete }: SolveStepProps) {
  const [timeSpent, setTimeSpent] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (!selectedAnswer) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [selectedAnswer])

  const handleSelect = (option: string) => {
    if (selectedAnswer) return
    setSelectedAnswer(option)
  }

  const isCorrect = selectedAnswer === step.answer

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-[#FFD700] px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] shadow-[3px_3px_0_#111]">
          <TestTube2 size={16} /> Solve
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold text-[#555]">
          <Timer size={16} />
          {String(Math.floor(timeSpent / 60)).padStart(2, '0')}:
          {String(timeSpent % 60).padStart(2, '0')}
        </span>
      </div>

      <div className="flex-1">
        <h2 className="text-3xl font-black uppercase leading-tight sm:text-4xl">{step.title}</h2>
        {step.question ? (
          <p className="mt-4 text-xl font-bold leading-relaxed text-[#222]">
            {step.question}
          </p>
        ) : null}

        <div className="mt-8 space-y-4">
          {step.options.map((option) => {
            const isSelected = selectedAnswer === option
            const isCorrectOption = option === step.answer
            
            let buttonClass = "bg-white border-black text-[#222]"
            if (selectedAnswer) {
              if (isSelected && isCorrect) buttonClass = "bg-[#00FF7F] border-black text-black shadow-[4px_4px_0_#111] translate-y-[2px]"
              else if (isSelected && !isCorrect) buttonClass = "bg-[#FF6F61] border-black text-white shadow-[2px_2px_0_#111] translate-y-[2px]"
              else if (isCorrectOption) buttonClass = "bg-[#00FF7F] border-black text-black opacity-80"
              else buttonClass = "bg-gray-100 border-gray-300 text-gray-400 opacity-60"
            }

            return (
              <button
                key={option}
                type="button"
                disabled={Boolean(selectedAnswer)}
                onClick={() => handleSelect(option)}
                className={`flex w-full items-center justify-between rounded-[20px] border-[3px] p-5 text-left text-lg font-bold shadow-[6px_6px_0_#111] transition-all hover:enabled:-translate-y-1 hover:enabled:shadow-[8px_8px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] ${buttonClass}`}
              >
                <span>{option}</span>
                {selectedAnswer && isSelected && isCorrect && <CheckCircle2 size={24} className="shrink-0" />}
                {selectedAnswer && isSelected && !isCorrect && <XCircle size={24} className="shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {selectedAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-center justify-between gap-4 rounded-[24px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#111]"
        >
          <div>
            <h3 className={`text-2xl font-black uppercase ${isCorrect ? 'text-[#00C853]' : 'text-[#D32F2F]'}`}>
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </h3>
            {!isCorrect && (
              <p className="mt-1 font-bold text-[#555]">
                The right answer is <span className="text-black">{step.answer}</span>.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onComplete(isCorrect, timeSpent)}
            className="inline-flex shrink-0 items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FFD700] px-6 py-4 text-base font-black uppercase shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            Continue <ArrowRight size={20} />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
