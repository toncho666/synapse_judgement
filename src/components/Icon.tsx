import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "tech" | "fund" | "port" | "news" | "earn" | "judge"
  | "check" | "arrowDown" | "arrowUpRight" | "bolt" | "shield"
  | "spark" | "gauge" | "refresh" | "plus" | "lock" | "play" | "target" | "layers";

const paths: Record<IconName, ReactNode> = {
  tech: (
    <>
      <path d="M7 3.5v3M7 15.5v5M17 5.5v2.5M17 16.5v3" />
      <rect x="4.6" y="6.5" width="4.8" height="9" rx="1.4" />
      <rect x="14.6" y="8" width="4.8" height="8.5" rx="1.4" />
    </>
  ),
  fund: (
    <>
      <path d="M4 9.5 12 4l8 5.5M4.5 20h15" />
      <path d="M6.5 9.5V17M10.2 9.5V17M13.8 9.5V17M17.5 9.5V17" />
      <path d="M4 17h16" />
    </>
  ),
  port: (
    <>
      <path d="M12 20.5a8.5 8.5 0 1 1 8.5-8.5" />
      <path d="M12 3.5A8.5 8.5 0 0 1 20.5 12H12z" />
      <path d="M15.5 15.5a5 5 0 1 1-7-7" opacity=".45" />
    </>
  ),
  news: (
    <>
      <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h11A1.5 1.5 0 0 1 18 6.5V18a1.5 1.5 0 0 0 1.5 1.5H6A2 2 0 0 1 4 17.5z" />
      <path d="M18 14h2v3.5a2 2 0 0 1-2 2" />
      <path d="M7 8.5h8M7 12h8M7 15.5h4.5" />
    </>
  ),
  earn: (
    <>
      <path d="M4 10.5v3M8 7.5v9M12 4.5v15M16 7.5v9M20 10.5v3" />
    </>
  ),
  judge: (
    <>
      <path d="M12 3.5v17M7.5 20.5h9M12 6.5 5.5 8.5M12 6.5l6.5 2" />
      <path d="M5.5 8.5 3 14.5a2.9 2.9 0 0 0 5 0zM18.5 8.5 16 14.5a2.9 2.9 0 0 0 5 0z" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrowDown: <path d="M12 4.5v15M6 13.5l6 6 6-6" />,
  arrowUpRight: <path d="M6.5 17.5 17.5 6.5M8.5 6.5h9v9" />,
  bolt: <path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12z" />,
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />
      <path d="m9 11.8 2.2 2.2L15.4 9.6" />
    </>
  ),
  spark: <path d="m12 3 1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />,
  gauge: (
    <>
      <path d="M4 15.5a8.5 8.5 0 1 1 16 0" />
      <path d="M12 15.5 16 9" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  refresh: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
      <path d="M20.5 3.5V9H15" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  play: <path d="M8.5 5.5v13l10-6.5z" fill="currentColor" stroke="none" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" opacity=".5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.5 8.5 4.5L12 12.5 3.5 8z" />
      <path d="m4.5 12.5 7.5 4 7.5-4M4.5 16.5l7.5 4 7.5-4" opacity=".5" />
    </>
  ),
};

export default function Icon({
  name,
  size = 24,
  ...rest
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
