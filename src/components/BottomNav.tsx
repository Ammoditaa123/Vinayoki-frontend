import { Gauge, Sparkles, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/feed', label: 'Feed', icon: Sparkles },
  { to: '/progress', label: 'Progress', icon: Gauge },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t-[3px] border-black bg-[#FFF8E8]">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2 px-3 py-3">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-[18px] border-[3px] border-black px-2 py-3 text-[10px] font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#111] ${
                isActive ? 'bg-[#00FF7F]' : 'bg-white'
              }`
            }
          >
            <Icon size={18} />
            <span className="mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
