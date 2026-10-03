import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Eye, Hammer, Search, TestTube2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext'
import { createUser } from '../services/userApi'
import type { LearningStyle, SkillLevel } from '../types'

const goalOptions = [
  'Build projects',
  'Get internship-ready',
  'Learn cybersecurity',
  'Improve coding',
  'Prepare for placements',
  'Explore tech careers',
]

const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced']

const learningStyles: { value: LearningStyle; icon: typeof Eye; description: string }[] = [
  {
    value: 'Watch',
    icon: Eye,
    description: 'I like seeing concepts explained first.',
  },
  {
    value: 'Solve',
    icon: TestTube2,
    description: 'I learn by testing myself.',
  },
  {
    value: 'Build',
    icon: Hammer,
    description: 'I learn by making things.',
  },
  {
    value: 'Explore',
    icon: Search,
    description: 'I like discovering new areas.',
  },
]

const steps = ['Name', 'Goal', 'Level', 'Style']

const stepVariants = {
  enter: { opacity: 0, x: 32, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -32, scale: 0.98 },
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { onboarding, setOnboardingData, setUserId, setUser } = useAppContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameError, setNameError] = useState('')
  const submitLock = useRef(false)

  const progressPct = Math.round(((currentStep + 1) / steps.length) * 100)

  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      const name = onboarding.name.trim()
      if (name.length < 2) {
        setNameError('Please enter at least 2 characters.')
        return false
      }
      setNameError('')
    }
    return true
  }

  const nextStep = () => {
    if (!validateCurrentStep()) return
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
      return
    }
    void submitOnboarding()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') nextStep()
  }

  const submitOnboarding = async () => {
    if (submitLock.current) return
    submitLock.current = true
    setIsSubmitting(true)

    try {
      const createdUser = await createUser({
        name: onboarding.name.trim(),
        goal: onboarding.goal,
        skillLevel: onboarding.skillLevel,
        learningStyle: onboarding.learningStyle,
      })

      const finalUser = {
        id: createdUser.id ?? null,
        name: createdUser.name ?? onboarding.name.trim(),
        goal: createdUser.goal ?? onboarding.goal,
        level: createdUser.level ?? onboarding.skillLevel,
        learning_style: createdUser.learning_style ?? onboarding.learningStyle,
      }

      setUser(finalUser)
      setUserId(finalUser.id)
      navigate('/feed')
    } catch (error) {
      console.error('User creation failed:', error)
      toast.error('Could not create your profile', {
        description: 'The learning engine is unreachable. Please try again.',
      })
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  const isStepValid = () => {
    if (currentStep === 0) return onboarding.name.trim().length >= 2
    if (currentStep === 1) return Boolean(onboarding.goal)
    if (currentStep === 2) return Boolean(onboarding.skillLevel)
    if (currentStep === 3) return Boolean(onboarding.learningStyle)
    return true
  }

  const stepLabels = [
    'What should we call you?',
    'What are you trying to get better at?',
    'Where are you starting from?',
    'How do you naturally like to learn?',
  ]

  const stepSubtitles = [
    'This is how Vinayoki will address you.',
    'Choose what you want to get better at.',
    'Pick the level that feels right today.',
    'We\'ll weight recommendations toward your style — but we\'ll still push you.',
  ]

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-[32px] border-[3px] border-black bg-[#FFF8E8] p-6 shadow-[8px_8px_0_#111] md:p-10">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD700] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_#111]">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-black bg-[#00FF7F]" />
            Build your Vinayoki
          </p>
          <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em]">
            {String(currentStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-8 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[3px_3px_0_#111]">
          <motion.div
            className="h-3 rounded-full bg-[#00FF7F]"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-black uppercase leading-tight md:text-4xl">
                {stepLabels[currentStep]}
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#555]">
                {stepSubtitles[currentStep]}
              </p>
            </div>

            {/* Step 0: Name input */}
            {currentStep === 0 && (
              <div>
                <input
                  type="text"
                  autoFocus
                  placeholder="Your name"
                  value={onboarding.name}
                  onChange={(e) => {
                    setNameError('')
                    setOnboardingData({ name: e.target.value })
                  }}
                  onKeyDown={handleKeyDown}
                  maxLength={50}
                  className="w-full rounded-[20px] border-[3px] border-black bg-white px-5 py-4 text-xl font-black uppercase placeholder:font-semibold placeholder:normal-case placeholder:text-[#999] shadow-[5px_5px_0_#111] outline-none focus:shadow-[7px_7px_0_#111] transition-shadow"
                />
                {nameError && (
                  <p className="mt-2 text-sm font-bold text-[#FF6F61]">{nameError}</p>
                )}
              </div>
            )}

            {/* Step 1: Goal */}
            {currentStep === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {goalOptions.map((goal) => {
                  const isSelected = onboarding.goal === goal
                  return (
                    <button
                      key={goal}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setOnboardingData({ goal })}
                      className={`flex items-center justify-between gap-3 rounded-[22px] border-[3px] border-black px-5 py-4 text-left text-sm font-black uppercase shadow-[4px_4px_0_#111] transition-all hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] ${
                        isSelected
                          ? 'translate-y-[2px] bg-[#C0F7FE] shadow-[2px_2px_0_#111]'
                          : 'bg-white'
                      }`}
                    >
                      <span>{goal}</span>
                      {isSelected && <Check size={16} className="shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 2: Skill level */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-3">
                {skillLevels.map((level, idx) => {
                  const isSelected = onboarding.skillLevel === level
                  const tones = ['bg-[#00FF7F]', 'bg-[#FFD700]', 'bg-[#FF6F61]']
                  return (
                    <button
                      key={level}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setOnboardingData({ skillLevel: level })}
                      className={`flex items-center justify-between gap-3 rounded-[22px] border-[3px] border-black px-5 py-4 text-left text-base font-black uppercase shadow-[4px_4px_0_#111] transition-all hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] ${
                        isSelected ? `translate-y-[2px] shadow-[2px_2px_0_#111] ${tones[idx]}` : 'bg-white'
                      }`}
                    >
                      <span>{level}</span>
                      {isSelected && <Check size={18} className="shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 3: Learning style */}
            {currentStep === 3 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {learningStyles.map(({ value, icon: Icon, description }) => {
                  const isSelected = onboarding.learningStyle === value
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setOnboardingData({ learningStyle: value })}
                      className={`flex flex-col gap-2 rounded-[22px] border-[3px] border-black p-5 text-left shadow-[4px_4px_0_#111] transition-all hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] ${
                        isSelected
                          ? 'translate-y-[2px] bg-[#C0F7FE] shadow-[2px_2px_0_#111]'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-[13px] border-[3px] border-black shadow-[3px_3px_0_#111] ${isSelected ? 'bg-[#FFD700]' : 'bg-[#FFF8E8]'}`}>
                          <Icon size={20} strokeWidth={2.5} />
                        </div>
                        {isSelected && <Check size={18} />}
                      </div>
                      <p className="text-base font-black uppercase">{value}</p>
                      <p className="text-xs font-semibold text-[#444] normal-case">{description}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="rounded-[16px] border-[3px] border-black bg-white px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#111] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
            >
              ← Back
            </button>
          ) : <span />}

          <button
            type="button"
            onClick={nextStep}
            disabled={isSubmitting || !isStepValid()}
            className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FFD700] px-6 py-3 text-base font-black uppercase shadow-[5px_5px_0_#111] disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:-translate-y-1 hover:enabled:shadow-[7px_7px_0_#111] transition-all focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            {currentStep === steps.length - 1
              ? isSubmitting
                ? 'Creating profile...'
                : 'Start learning'
              : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  )
}
