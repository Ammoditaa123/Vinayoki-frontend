import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext'
import { createUser } from '../services/userApi'
import type { GoalType, LearningStyle, SkillLevel } from '../types'

const goals: GoalType[] = [
  'Cybersecurity',
  'Python',
  'Web Development',
  'AI / ML',
  'DSA',
  'Career Skills',
  'Explore',
]

const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced']
const learningStyles: LearningStyle[] = ['Watch', 'Solve', 'Build', 'Explore']
const steps = ['Goal', 'Skill level', 'Learning style']

export default function Onboarding() {
  const navigate = useNavigate()
  const { onboarding, setOnboardingData, setUserId, setUser } = useAppContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)

  const progressText = `${String(currentStep + 1).padStart(2, '0')} — ${String(steps.length).padStart(2, '0')}`
  const stepPrompts = [
    'Choose what you want to get better at.',
    'Pick the level that feels right today.',
    'Choose how you like to make progress.',
  ]

  const selectOption = (value: string) => {
    if (currentStep === 0) {
      setOnboardingData({ goal: value as GoalType })
    }
    if (currentStep === 1) {
      setOnboardingData({ skillLevel: value as SkillLevel })
    }
    if (currentStep === 2) {
      setOnboardingData({ learningStyle: value as LearningStyle })
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
      return
    }

    void submitOnboarding()
  }

  const submitOnboarding = async () => {
    if (submitLock.current) return

    submitLock.current = true
    setIsSubmitting(true)

    try {
      const createdUser = await createUser({
        name: 'Ammoditaa',
        goal: onboarding.goal,
        skillLevel: onboarding.skillLevel,
        learningStyle: onboarding.learningStyle,
      })

      const finalUser = {
        id: createdUser.id ?? null,
        name: createdUser.name ?? 'Ammoditaa',
        goal: createdUser.goal ?? onboarding.goal,
        skillLevel: (createdUser.level ?? onboarding.skillLevel) as SkillLevel,
        learningStyle: (createdUser.learning_style ?? onboarding.learningStyle) as LearningStyle,
      }

      setUser(finalUser)
      setUserId(finalUser.id)
      navigate('/feed')
    } catch (error) {
      console.error('User creation failed:', error)
      toast.error('Momentum is offline', {
        description: 'We could not reach the learning engine. Please try again.',
      })
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  const options =
    currentStep === 0 ? goals : currentStep === 1 ? skillLevels : learningStyles

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-[32px] border-[3px] border-black bg-[#FFF8E8] p-6 shadow-[8px_8px_0_#111] md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD700] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_#111]">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-black bg-[#00FF7F]" /> Build your Vinayoki
          </p>
          <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em]">{progressText.replace(' — ', ' / ')}</span>
        </div>

        <div className="mb-8 flex gap-2">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`h-3 flex-1 rounded-full border-[3px] border-black ${
                index <= currentStep ? 'bg-[#00FF7F]' : 'bg-white'
              }`}
            />
          ))}
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div>
          <h2 className="text-3xl font-black uppercase md:text-5xl">
            {currentStep === 0 && 'What are you trying to get better at?'}
            {currentStep === 1 && 'What is your skill level?'}
            {currentStep === 2 && 'What is your learning style?'}
          </h2>
          <p className="-mt-3 text-sm font-semibold text-[#444444]">{stepPrompts[currentStep]}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {options.map((option) => {
              const isSelected =
                currentStep === 0
                  ? onboarding.goal === option
                  : currentStep === 1
                    ? onboarding.skillLevel === option
                    : onboarding.learningStyle === option

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectOption(option)}
                  className={`flex items-center justify-between gap-3 rounded-[24px] border-[3px] border-black px-5 py-4 text-left text-base font-black uppercase shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] ${
                    isSelected ? 'translate-y-[2px] bg-[#C0F7FE] shadow-[2px_2px_0_#111]' : 'bg-white'
                  }`}
                >
                  {option}
                  {isSelected ? <span className="inline-flex items-center gap-1 text-xs" aria-hidden="true"><Check size={16} /> Selected</span> : null}
                </button>
              )
            })}
          </div>
        </motion.div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={nextStep}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FFD700] px-6 py-3 text-base font-black uppercase shadow-[5px_5px_0_#111] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            {currentStep === steps.length - 1 ? (isSubmitting ? 'Creating profile...' : 'Create profile') : 'Next'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  )
}
