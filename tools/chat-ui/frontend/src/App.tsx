import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ProjectContextProvider } from "./components/ProjectContext";
import { AgentPicker } from "./pages/AgentPicker";
import { CommandRunner } from "./pages/CommandRunner";
import { DocumentViewer } from "./pages/DocumentViewer";
import { EstimationView } from "./pages/EstimationView";
import { ProjectPicker } from "./pages/ProjectPicker";
import { ReadyPane } from "./pages/ReadyPane";

export function App() {
  return (
    <ProjectContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ProjectPicker />} />
            <Route path="agents" element={<AgentPicker />} />
            <Route path="ready" element={<ReadyPane />} />
            <Route path="docs" element={<DocumentViewer />} />
            <Route path="run" element={<CommandRunner />} />
            <Route path="estimation" element={<EstimationView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProjectContextProvider>
  );
}
