import type { CSSProperties, ReactNode } from "react";
import { useInView } from "../lib/hooks";

export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" | "article" }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const style: CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};
  return <Tag ref={ref as any} className={`reveal ${inView ? "is-in" : ""} ${className}`} style={style}>{children}</Tag>;
}
