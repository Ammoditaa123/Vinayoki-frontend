import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Welcome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-[32px] border-[3px] border-black bg-[#C0F7FE] p-6 shadow-[8px_8px_0_#111] md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD700] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_#111]">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-black bg-[#00FF7F]" />
              Vinayoki
            </p>
            <h1 className="font-display text-5xl leading-none text-black md:text-7xl">
              Turn 3 minutes into real progress.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[#333333]">
              A learning feed that turns a few minutes of curiosity into something you can do.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FF6F61] px-6 py-3 text-base font-black uppercase tracking-[0.08em] shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_#111]"
              >
                Start your next move <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-4 shadow-[7px_7px_0_#111]">
            <div className="space-y-3">
              {['WATCH', 'ANSWER', 'BUILD', 'PROGRESS'].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-24 rounded-full border-[3px] border-black bg-white px-2 py-1 text-center text-[10px] font-black tracking-[0.18em]">
                    {step}
                  </div>
                  {index < 3 ? <div className="text-xl font-black">↓</div> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
