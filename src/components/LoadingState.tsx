export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-[24px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#111]">
      <div className="flex items-center gap-3 text-lg font-black uppercase tracking-[0.12em] text-black">
        <span className="h-4 w-4 animate-bounce rounded-full bg-[#FFD700]" />
        {label}
      </div>
    </div>
  )
}

export default LoadingState
