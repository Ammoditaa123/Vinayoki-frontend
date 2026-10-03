import { useEffect } from 'react'
import { Hammer, MessageCircleQuestion, SkipForward, Sparkles, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { useAppContext } from '../context/AppContext'
import { useLearnerSnapshot } from '../hooks/useLearnerSnapshot'

export default function Profile() {
  const navigate = useNavigate()
  const { user, userId, setUser, setUserId } = useAppContext()
  const { engagement, loading, error, refetch } = useLearnerSnapshot(userId)

  useEffect(() => {
    if (!error?.toLowerCase().includes('user not found')) return
    setUser(null)
    setUserId(null)
    navigate('/onboarding', { replace: true })
  }, [error, navigate, setUser, setUserId])
  const displayName = user?.name ?? 'Learner'
  const initials = displayName.slice(0, 1).toUpperCase()
  const profileDetails = [
    ['Goal', user?.goal ?? 'Not available'],
    ['Level', user?.skillLevel ?? user?.level ?? 'Not available'],
    ['Style', user?.learningStyle ?? user?.learning_style ?? 'Not available'],
    ['Learner ID', userId ? `#${userId}` : 'Not available'],
  ]
  const learnerSignals = [
    { label: 'Complete', icon: Check, tone: 'bg-[#00FF7F]' },
    { label: 'Solve', icon: MessageCircleQuestion, tone: 'bg-[#FFD700]' },
    { label: 'Skip', icon: SkipForward, tone: 'bg-[#FFB7AA]' },
    { label: 'Build', icon: Hammer, tone: 'bg-[#C0F7FE]' },
  ]

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {loading ? <LoadingState label="Loading your profile signals..." /> : null}

      {error ? (
        <div role="alert" className="mb-5 rounded-[20px] border-[3px] border-black bg-[#FFE1DC] p-4 font-semibold shadow-[4px_4px_0_#111]">
          <p>Recent engagement signals are unavailable. {error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-3 rounded-[14px] border-[3px] border-black bg-[#FFD700] px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            Retry signals
          </button>
        </div>
      ) : null}

      {!loading ? <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border-[3px] border-black bg-[#C0F7FE] p-5 shadow-[8px_8px_0_#111] sm:p-7">
          <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-5 rotate-12 text-[#FFD700]">
            <Sparkles size={84} strokeWidth={1.5} />
          </div>
          <div className="relative flex flex-wrap items-center gap-4">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[20px] border-[3px] border-black bg-[#FFD700] text-3xl font-black uppercase shadow-[5px_5px_0_#111]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4B0082]">Your learner profile</p>
              <h1 className="mt-1 break-words text-3xl font-black uppercase leading-none sm:text-4xl">{displayName}<span className="text-[#FF6F61]">.</span></h1>
              <p className="mt-2 text-sm font-semibold text-[#222222]">{user ? 'Your focus and style, all in one place.' : 'Some profile details are unavailable for this learner.'}</p>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {profileDetails.slice(0, 3).map(([label, value], index) => (
              <div key={label} className={`rounded-[17px] border-[3px] border-black p-3 shadow-[3px_3px_0_#111] ${['bg-[#FFD700]', 'bg-white', 'bg-[#00FF7F]'][index]}`}>
                <p className="text-[9px] font-black uppercase tracking-[0.14em]">{label}</p>
                <p className="mt-1 break-words text-sm font-black uppercase">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[6px_6px_0_#111] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#4B0082]">Signals, not screen time</p>
              <h2 className="mt-1 text-2xl font-black uppercase">Your learning signals</h2>
            </div>
            <p className="text-xs font-bold">Recent engagement window</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] border-[3px] border-black bg-[#FFD700] p-4 shadow-[3px_3px_0_#111]">
              <p className="text-3xl font-black">{loading ? '…' : engagement?.meaningful_actions ?? '—'}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] sm:text-xs">Meaningful actions</p>
            </div>
            <div className="rounded-[18px] border-[3px] border-black bg-white p-4 shadow-[3px_3px_0_#111]">
              <p className="text-3xl font-black">{loading ? '…' : engagement?.recent_views ?? '—'}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] sm:text-xs">Recent views</p>
            </div>
          </div>
        </section>

        <section className="rounded-[26px] border-[3px] border-black bg-white p-5 shadow-[6px_6px_0_#111] sm:p-6" aria-labelledby="adaptation-title">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#C0F7FE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#4B0082]">
            <Sparkles size={13} aria-hidden="true" /> How Vinayoki adapts
          </p>
          <h2 id="adaptation-title" className="mt-3 text-2xl font-black uppercase">Progress over screen time.</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-[#333333]">
            The learning engine uses your recent actions alongside activity details to shape recommendations. These signals are not a personality profile or a mastery score.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {learnerSignals.map(({ label, icon: Icon, tone }) => (
              <div key={label} className={`flex items-center gap-2 rounded-[16px] border-[3px] border-black p-3 shadow-[3px_3px_0_#111] ${tone}`}>
                <Icon size={17} aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-bold text-[#333333]">Vinayoki uses these signals to shape what appears next.</p>
        </section>
      </div> : null}
    </main>
  )
}
