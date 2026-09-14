import { useCallback, useEffect, useState } from "react";
import { AGENTS, type AgentId } from "./engine";

export type Route = 
  | { name: "home" } 
  | { name: "agent"; id: AgentId }
  | { name: "auth" }
  | { name: "dashboard" }
  | { name: "leaderboard" };

export function parseHash(): Route {
  const h = window.location.hash;
  
  const agentMatch = h.match(/^#\/agent\/(\w+)/);
  if (agentMatch) {
    const id = agentMatch[1] as AgentId;
    if (AGENTS.some((a) => a.id === id)) return { name: "agent", id };
  }
  
  if (h === "#/auth" || h === "#/login" || h === "#/register") return { name: "auth" };
  if (h === "#/dashboard" || h === "#/account") return { name: "dashboard" };
  if (h === "#/leaderboard") return { name: "leaderboard" };
  
  return { name: "home" };
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const nav = useCallback((r: Route) => {
    const target = 
      r.name === "agent" ? `/agent/${r.id}` :
      r.name === "auth" ? "/auth" :
      r.name === "dashboard" ? "/dashboard" :
      r.name === "leaderboard" ? "/leaderboard" :
      "/";
    if (window.location.hash === `#${target}`) return;
    window.location.hash = target;
  }, []);

  return { route, nav };
}
