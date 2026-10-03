import { motion } from 'framer-motion'
import { ArrowRight, Hammer, Lightbulb, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { NormalizedStep } from '../types'

interface BuildStepProps {
  step: NormalizedStep
  onComplete: (buildScore: number, timeSpent: number) => void
}

export default function BuildStep({ step, onComplete }: BuildStepProps) {
  const [timeSpent, setTimeSpent] = useState(0)
  const [code, setCode] = useState(step.starter_code ?? '')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (!submitted) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [submitted])

  const handleSubmit = () => {
    if (submitted) return
    setSubmitted(true)
  }

  const handleFinish = () => {
    // Basic MVP scoring: 1.0 if they wrote something, 0.5 if they just submitted empty
    const buildScore = code.trim().length > 0 ? 1.0 : 0.5
    onComplete(buildScore, timeSpent)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-[#FF6F61] px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-white shadow-[3px_3px_0_#111]">
          <Hammer size={16} /> Build
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
          <p className="mt-4 text-lg font-bold leading-relaxed text-[#222]">
            {step.content}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={submitted}
            placeholder="Write your solution here..."
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-[20px] border-[3px] border-black bg-[#282a36] p-5 font-mono text-[15px] leading-relaxed text-[#f8f8f2] shadow-[6px_6px_0_#111] focus:shadow-[8px_8px_0_#111] focus:outline-none disabled:opacity-80 transition-all"
          />
        </div>
      </div>

      {!submitted ? (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FFD700] px-8 py-4 text-lg font-black uppercase shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            Mark as built <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-[24px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#111]"
        >
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-black uppercase">
                <Lightbulb size={24} className="text-[#FFD700]" /> Review your work
              </h3>
              {step.expected_output && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-bold uppercase text-[#555]">Expected approach:</p>
                  <pre className="overflow-x-auto rounded-[16px] border-2 border-black bg-[#f1f1f1] p-4 font-mono text-sm shadow-[4px_4px_0_#111]">
                    {step.expected_output}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="flex justify-end border-t-2 border-dashed border-gray-200 pt-6">
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex shrink-0 items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#00FF7F] px-8 py-4 text-lg font-black uppercase shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
              >
                Complete <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
