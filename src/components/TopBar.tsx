import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, UserRound } from 'lucide-react'

export function TopBar() {
  const location = useLocation()
  const showBack = location.pathname !== '/feed'

  return (
    <header className="sticky top-0 z-20 border-b-[3px] border-black bg-[#FFF8E8]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {showBack ? (
            <Link
              to="/feed"
              aria-label="Back to feed"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border-[3px] border-black bg-[#C0F7FE] shadow-[3px_3px_0_#111]"
            >
              <ArrowLeft size={18} />
            </Link>
          ) : null}

          <Link to="/feed" className="truncate text-xl font-black uppercase tracking-[-0.07em] text-black sm:text-2xl">
            Vinayoki
          </Link>
        </div>

        <Link
          to="/profile"
          aria-label="Profile"
          className="inline-flex shrink-0 items-center gap-2 rounded-[16px] border-[3px] border-black bg-[#FFD700] px-2 py-2 text-[10px] font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] sm:px-3 sm:text-xs sm:tracking-[0.12em]"
        >
          <UserRound size={16} />
          <span className="hidden min-[360px]:inline">Profile</span>
        </Link>
      </div>
    </header>
  )
}

export default TopBar
