import { Shield } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        {/* Abstract Pitch Pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-background to-background" />
        <div className="pitch-pattern absolute inset-0 opacity-10" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative z-10">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] border border-primary/20">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-wide mb-4 text-white">
              PITCH<span className="text-primary">CONTROLLER</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Professional team management for the modern era. Tactics, squad analysis, and match planning in one sleek interface.
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <button
              onClick={handleLogin}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-out flex items-center justify-center gap-3"
            >
              Sign In to Continue
            </button>
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="hidden lg:flex flex-1 relative z-10 items-center justify-center p-16 bg-black/20 backdrop-blur-sm border-l border-white/5">
        <div className="relative w-full max-w-lg aspect-square">
          {/* Decorative circles */}
          <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-8 rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-16 rounded-full border border-primary/20 animate-[spin_20s_linear_infinite]" />
          
          <div className="absolute inset-0 flex items-center justify-center">
             {/* Dynamic tactical board graphic could go here */}
             <div className="text-center space-y-2">
               <div className="text-6xl font-display font-bold text-white/10">4 - 3 - 3</div>
               <div className="text-sm text-primary uppercase tracking-[0.5em]">Attacking</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
