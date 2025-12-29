export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Credit Section with Beautiful Design */}
        <div className="relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-6">
            {/* Development Information */}
            <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:gap-2 sm:flex-wrap">
              {/* Developed By */}
              <div className="flex items-center justify-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative px-4 py-2 bg-slate-950 rounded-lg border border-cyan-500/30 group-hover:border-cyan-400 transition-all">
                    <span className="text-white/70 text-sm">
                      <span className="font-semibold text-cyan-400">Developed by</span>
                      <span className="text-white/60"> MNR Group IT Team</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="hidden sm:block text-white/30 text-xl">|</div>

              {/* Web Software Assistance */}
              <div className="flex items-center justify-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative px-4 py-2 bg-slate-950 rounded-lg border border-orange-500/30 group-hover:border-orange-400 transition-all">
                    <span className="text-white/70 text-sm">
                      <span className="font-semibold text-orange-400">Web App Assistance</span>
                      <span className="text-white/60">: </span>
                      <a 
                        href="tel:+8801838047391"
                        className="font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                        title="Call Nabab Sharif"
                      >
                        Nabab Sharif
                      </a>
                      <span className="text-white/60"> (</span>
                      <a 
                        href="tel:+8801838047391"
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Call: 01838047391"
                      >
                        01838047391
                      </a>
                      <span className="text-white/60">)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright Info */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs sm:text-sm text-white/50">
                © {currentYear} Anis Memorial Badminton Tournament. All rights reserved. | Organized by <span className="text-cyan-400 font-semibold">MNR Group</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
