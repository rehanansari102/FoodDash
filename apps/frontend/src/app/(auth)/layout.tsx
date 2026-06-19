export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)' }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl border border-white/30">🍔</div>
            <span className="text-2xl font-black text-white tracking-tight">SnapBite</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight animate-fade-up">
                Great food,<br /><span className="text-orange-200">delivered fast.</span>
              </h1>
              <p className="mt-5 text-orange-100 text-lg leading-relaxed animate-fade-up delay-100">
                Hundreds of restaurants, thousands of dishes — right at your fingertips.
              </p>
            </div>
            <div className="flex flex-col gap-3 animate-fade-up delay-200">
              {[
                { icon: '⚡', label: 'Lightning-fast delivery' },
                { icon: '🍽️', label: 'Curated local restaurants' },
                { icon: '🔒', label: 'Safe & secure checkout' },
                { icon: '📍', label: 'Real-time order tracking' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3.5 hover:bg-white/20 transition-colors duration-200">
                  <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
                  <span className="text-white font-semibold text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/20 pt-6">
            <p className="text-orange-100 text-sm italic">"The best food app I've ever used."</p>
            <p className="text-white/50 text-xs mt-1.5">— Happy SnapBite customer</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="lg:hidden flex items-center gap-3 px-6 pt-8 pb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-lg shadow-lg shadow-orange-200/60">🍔</div>
          <span className="text-xl font-black text-gray-900">SnapBite</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-[400px] animate-fade-up">{children}</div>
        </div>
        <p className="text-center text-xs text-gray-400 pb-6">© 2026 SnapBite · All rights reserved</p>
      </div>
    </div>
  )
}
