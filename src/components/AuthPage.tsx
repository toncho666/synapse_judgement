import { useState } from "react";
import Icon from "./Icon";
import { login, register } from "../lib/auth";

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AuthPage({ onSuccess, onBack }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@synapse.ai");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        await register(email, name, password);
      }
      onSuccess();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* ambient */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="anim-drift1 absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.10),transparent_65%)]" />
        <div className="anim-drift2 absolute top-[38%] left-[-12%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.10),transparent_65%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16 md:px-8">
        <div className="w-full max-w-md">
          {/* back */}
          <button
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-[14px] font-semibold text-sub transition-colors hover:text-ink"
          >
            <Icon name="arrowDown" size={15} className="rotate-90" />
            Back to home
          </button>

          {/* logo */}
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-accent to-violet">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="6" r="2.4" fill="white" stroke="none" />
                <circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" />
                <circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" />
                <path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" />
              </svg>
            </span>
            <div>
              <p className="text-[20px] font-extrabold tracking-tight text-ink">Synapse Judgement</p>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">AI Investment Council</p>
            </div>
          </div>

          {/* tabs */}
          <div className="mb-8 flex gap-1 rounded-full bg-card p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-5 py-2.5 text-[14px] font-bold transition-all duration-300 ${
                mode === "login" ? "bg-white text-ink shadow-soft" : "text-sub hover:text-ink"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full px-5 py-2.5 text-[14px] font-bold transition-all duration-300 ${
                mode === "register" ? "bg-white text-ink shadow-soft" : "text-sub hover:text-ink"
              }`}
            >
              Create account
            </button>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div>
                <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-[12px] border-2 border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-300 focus:border-accent"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-[12px] border-2 border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-300 focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-[12px] border-2 border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-300 focus:border-accent"
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-[10px] bg-[#fff1f0] px-4 py-3 text-[13px] font-semibold text-[#b3271e]">
                <Icon name="bolt" size={15} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-accent to-violet px-8 py-4 text-[15px] font-bold text-white shadow-[0_12px_32px_rgba(0,122,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,122,255,0.45)] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin">
                    <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <Icon name="arrowUpRight" size={17} />
                </>
              )}
            </button>
          </form>

          {/* demo hint */}
          {mode === "login" && (
            <div className="mt-6 rounded-[14px] border border-dashed border-line bg-card/60 px-5 py-4">
              <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
                <Icon name="spark" size={15} className="text-amber" />
                Demo credentials pre-filled
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-sub">
                Just click "Sign in" to explore the dashboard with sample data.
              </p>
            </div>
          )}

          {/* welcome bonus */}
          {mode === "register" && (
            <div className="mt-6 rounded-[14px] border border-mint/30 bg-[#e9f9ef] px-5 py-4">
              <p className="flex items-center gap-2 text-[13px] font-bold text-[#1b7a41]">
                <Icon name="spark" size={15} />
                Welcome bonus: 50 credits
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#1b7a41]/80">
                Get 50 free credits on signup — enough for ~10 analyses.
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-[12px] leading-relaxed text-faint">
            By continuing, you agree to our{" "}
            <a href="#" className="font-semibold text-accent hover:text-violet">Terms</a> and{" "}
            <a href="#" className="font-semibold text-accent hover:text-violet">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
