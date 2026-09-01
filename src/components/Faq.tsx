import { useState } from "react";
import Icon from "./Icon";
import Reveal from "./Reveal";

const ITEMS = [
  {
    q: "How fast is the verdict?",
    a: "A full session — the agents’ parallel work plus the Judge’s synthesis — takes about 90 seconds. In this demo the timeline is slightly compressed so you don’t have to wait.",
  },
  {
    q: "Why is the Judge free with two agents?",
    a: "A single opinion doesn’t need an arbiter. The Judge becomes essential the moment two or more briefs appear — so we build its cost into the team and never charge it separately.",
  },
  {
    q: "Do I need to register or add a card?",
    a: "No. You can assemble the order and see the exact total without an account. Payment details are requested only after you press “Run analysis” and confirm the price.",
  },
  {
    q: "Is this investment advice?",
    a: "No. The verdict is an analytical synthesis of public financials, transcripts, news and price action. The final decision — and responsibility for it — is always yours.",
  },
  {
    q: "Can the agents see each other’s briefs?",
    a: "No. Agents run in isolation and never share context — that is precisely the point. Only the Judge sees every brief at once, weighs them by confidence and records dissenting views in the reasoning.",
  },
  {
    q: "What if I pick only one agent?",
    a: "You still get its full brief. The Judge synthesizes a verdict from a single source, and its work is added to the order at $15 — shown upfront, before you run anything.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-6xl px-5 py-24 md:px-8 lg:py-32">
      <Reveal>
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">06 · FAQ</p>
        <h2 className="mt-3 max-w-xl text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
          Questions the Judge gets asked most
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal delay={100}>
          <div className="lg:sticky lg:top-32">
            <p className="max-w-sm text-[16px] leading-relaxed text-sub">
              Everything about pricing, the verdict and what happens behind the scenes — in plain
              language, with no fine print.
            </p>
            <a
              href="mailto:court@synapse.jdg"
              className="group mt-6 inline-flex items-center gap-2 text-[15px] font-bold text-accent transition-colors hover:text-violet"
            >
              Something else? Write to the court
              <Icon name="arrowUpRight" size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Reveal>

        <div className="space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 70}>
                <div
                  className={`rounded-[20px] border transition-all duration-300 ${
                    isOpen ? "border-line bg-white shadow-soft" : "border-line bg-card hover:border-faint/60"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-[16.5px] font-extrabold tracking-tight">{item.q}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line transition-all duration-300 ${
                        isOpen ? "rotate-45 border-accent bg-accent text-white" : "text-faint"
                      }`}
                    >
                      <Icon name="plus" size={15} />
                    </span>
                  </button>
                  <div className={`acc-body ${isOpen ? "open" : ""}`}>
                    <div className="acc-inner">
                      <p className="px-6 pb-6 text-[14.5px] leading-relaxed text-sub">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
