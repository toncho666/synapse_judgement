import Icon, { type IconName } from "./Icon";
import Reveal from "./Reveal";

const STEPS: { n: string; title: string; text: string; icon: IconName }[] = [
  {
    n: "01",
    title: "The request",
    text: "A ticker and, optionally, your portfolio size. Nothing else required — no forms, sign-ups or “tell us about yourself”.",
    icon: "target",
  },
  {
    n: "02",
    title: "Parallel breakdown",
    text: "The agents you picked work simultaneously and never see each other’s briefs. Each answers only through its own lens — that rules out herd thinking.",
    icon: "layers",
  },
  {
    n: "03",
    title: "Weighted synthesis",
    text: "The Judge compares arguments, weights them by each agent’s confidence, and records who dissented — and why.",
    icon: "judge",
  },
  {
    n: "04",
    title: "A verdict with reasoning",
    text: "BUY / HOLD / SELL, a 0–100 confidence score and written reasoning: why the call stands and which argument carried the most weight.",
    icon: "gauge",
  },
];

export default function Pipeline() {
  return (
    <section id="synthesis" className="relative border-y border-line bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-32">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">03 · How it works</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] md:text-5xl">
              One verdict.<br />Five independent minds.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-sub">
              We don’t average opinions or make the models “agree”. The agents argue — the Judge weighs
              the arguments and delivers a decision it can account for, word by word.
            </p>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[12.5px] text-faint">
              <span><strong className="text-ink">0</strong> shared context between agents</span>
              <span><strong className="text-ink">100%</strong> of arguments in the reasoning</span>
              <span><strong className="text-ink">1</strong> final decision</span>
            </div>
          </Reveal>
        </div>

        <ol className="relative space-y-5">
          <span className="absolute bottom-8 left-[27px] top-8 w-px bg-gradient-to-b from-accent via-violet to-line" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110} as="li">
              <div className="group relative flex gap-5 rounded-[22px] border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift md:p-7">
                <span className="relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink shadow-soft transition-colors duration-300 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-accent group-hover:to-violet group-hover:text-white">
                  <Icon name={s.icon} size={24} />
                </span>
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-faint">STEP {s.n}</p>
                  <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-sub">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
