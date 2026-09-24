import Icon from "./Icon";
import { useScrolled } from "../lib/hooks";
import type { User } from "../lib/auth";

const LINKS = [
  { href: "#agents", label: "Agents" },
  { href: "#synthesis", label: "How it works" },
  { href: "#result", label: "Dashboard" },
  { href: "#pricing", label: "Pricing" },
];

interface Props {
  user: User | null;
  onDashboard: () => void;
  onAuth: () => void;
}

export default function Nav({ user, onDashboard, onAuth }: Props) {
  const scrolled = useScrolled(24);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-line bg-white/75 shadow-soft backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-accent to-violet transition-transform duration-300 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="6" r="2.4" fill="white" stroke="none" />
              <circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" />
              <circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" />
              <path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" />
            </svg>
          </span>
          <span className="leading-none">
            <span className="block text-[16px] font-extrabold tracking-tight text-ink">Synapse</span>
            <span className="block font-display text-[9px] font-semibold uppercase tracking-[0.28em] text-faint">Judgement</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-[14px] font-semibold text-sub transition-colors duration-300 hover:text-ink"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#/leaderboard"
            className="group relative text-[14px] font-semibold text-sub transition-colors duration-300 hover:text-ink"
          >
            Leaderboard
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-300 group-hover:w-full" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full bg-card px-4 py-2 font-mono text-[12px] font-bold text-ink md:flex">
                <Icon name="spark" size={14} className="text-amber" />
                {user.credits} credits
              </div>
              <button
                onClick={onDashboard}
                className="flex items-center gap-2.5 rounded-full border border-line px-4 py-2 transition-all duration-300 hover:border-accent"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-[14px]">
                  {user.avatar}
                </span>
                <span className="hidden text-[13px] font-bold text-ink md:inline">{user.name.split(' ')[0]}</span>
              </button>
            </>
          ) : (
            <>
              <span className="hidden rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] font-semibold text-sub lg:block">
                v2.4
              </span>
              <button
                onClick={onAuth}
                className="group inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink px-5 py-2.5 text-[14px] font-bold text-ink transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-accent hover:to-violet hover:text-white"
              >
                <Icon name="judge" size={16} />
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
