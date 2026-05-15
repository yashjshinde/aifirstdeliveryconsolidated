import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface Ctx {
  project: string | null;
  agent: string | null;
  feature: string | null;
  setProject: (p: string | null) => void;
  setAgent: (a: string | null) => void;
  setFeature: (f: string | null) => void;
}

const ProjectCtx = createContext<Ctx | null>(null);

export function ProjectContextProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<string | null>(null);
  const [agent, setAgent] = useState<string | null>(null);
  const [feature, setFeature] = useState<string | null>(null);

  // Resetting project nullifies agent/feature; resetting agent nullifies feature.
  const wrappedSetProject = (p: string | null) => {
    setProject(p);
    if (p !== project) {
      setAgent(null);
      setFeature(null);
    }
  };
  const wrappedSetAgent = (a: string | null) => {
    setAgent(a);
    if (a !== agent) setFeature(null);
  };

  const value = useMemo<Ctx>(() => ({
    project, agent, feature,
    setProject: wrappedSetProject,
    setAgent: wrappedSetAgent,
    setFeature,
  }), [project, agent, feature]);
  return <ProjectCtx.Provider value={value}>{children}</ProjectCtx.Provider>;
}

export function useProjectContext(): Ctx {
  const v = useContext(ProjectCtx);
  if (!v) throw new Error("useProjectContext must be used inside <ProjectContextProvider>");
  return v;
}
