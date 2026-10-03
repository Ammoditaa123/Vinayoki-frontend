import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Welcome() {
  const loopSteps = [
    { label: 'Attention', color: 'bg-white' },
    { label: 'Action', color: 'bg-[#C0F7FE]' },
    { label: 'Feedback', color: 'bg-[#FFD700]' },
    { label: 'Progress', color: 'bg-[#FF6F61]' },
    { label: 'Adaptation', color: 'bg-[#00FF7F]' },
  ]

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
      <div className="relative w-full overflow-hidden rounded-[32px] border-[3px] border-black bg-[#C0F7FE] p-6 shadow-[8px_8px_0_#111] md:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-10 text-[#FFD700] opacity-40">
          <Sparkles size={250} strokeWidth={1} />
        </div>
        
        <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD700] px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_#111]"
            >
              <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full border-2 border-black bg-[#00FF7F]" />
              Vinayoki Platform
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-display text-5xl font-black uppercase leading-[0.95] text-black md:text-7xl"
            >
              Turn 3 minutes into real progress<span className="text-[#FF6F61]">.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg font-bold leading-relaxed text-[#222]"
            >
              A learning feed that turns a few minutes of curiosity into something you can actually do. The system watches what you build and adapts what it gives you next.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FF6F61] px-8 py-4 text-base font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
              >
                Start your next move <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.4 }}
            className="rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-6 shadow-[7px_7px_0_#111] lg:p-8"
          >
            <p className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#4B0082]">
              The Core Loop
            </p>
            <div className="space-y-4">
              {loopSteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`flex h-10 w-32 items-center justify-center rounded-full border-[3px] border-black text-[11px] font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_#111] ${step.color}`}>
                    {step.label}
                  </div>
                  {index < 4 ? <div className="font-black text-[#555]">↓</div> : null}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
