import { useCallback, useEffect, useState } from "react";
import { AGENTS, type AgentId } from "./engine";

export type Route = { name: "home" } | { name: "agent"; id: AgentId };

export function parseHash(): Route {
  const h = window.location.hash;
  const m = h.match(/^#\/agent\/(\w+)/);
  if (m) {
    const id = m[1] as AgentId;
    if (AGENTS.some((a) => a.id === id)) return { name: "agent", id };
  }
  return { name: "home" };
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const nav = useCallback((r: Route) => {
    const target = r.name === "agent" ? `/agent/${r.id}` : "/";
    if (window.location.hash === `#${target}`) return;
    window.location.hash = target;
  }, []);

  return { route, nav };
}
