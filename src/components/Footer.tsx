export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-card border-t border-primary/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Credit Section with Beautiful Design */}
        <div className="relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-6">
            {/* Development Information */}
            <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:gap-2 sm:flex-wrap">
              {/* Developed By */}
              <div className="flex items-center justify-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative px-4 py-2 bg-background rounded-lg border border-primary/30 group-hover:border-primary/80 transition-all">
                    <span className="text-muted-foreground text-sm">
                      <span className="font-semibold text-primary">Developed by</span>
                      <span className="text-muted-foreground"> MNR Group IT Team</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="hidden sm:block text-muted-foreground/30 text-xl">|</div>

              {/* Web Software Assistance */}
              <div className="flex items-center justify-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative px-4 py-2 bg-background rounded-lg border border-secondary/30 group-hover:border-secondary/80 transition-all">
                    <span className="text-muted-foreground text-sm">
                      <span className="font-semibold text-secondary">Web App Assistance</span>
                      <span className="text-muted-foreground">: </span>
                      <a 
                        href="tel:+8801838047391"
                        className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        title="Call Nabab Sharif"
                      >
                        Nabab Sharif
                      </a>
                      <span className="text-muted-foreground"> (</span>
                      <a 
                        href="tel:+8801838047391"
                        className="text-accent hover:text-accent/80 transition-colors"
                        title="Call: 01838047391"
                      >
                        01838047391
                      </a>
                      <span className="text-muted-foreground">)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright Info */}
            <div className="text-center pt-4 border-t border-primary/10">
              <p className="text-xs sm:text-sm text-muted-foreground">
                © {currentYear} Anis Memorial Badminton Tournament. All rights reserved. | Organized by <span className="text-primary font-semibold">MNR Group</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
