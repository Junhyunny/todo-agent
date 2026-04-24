// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { HashRouter, Route, Routes } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { MainWindow } from "@/windows/MainWindow.tsx";

export const App = () => (
  <TooltipProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainWindow />} />
      </Routes>
    </HashRouter>
  </TooltipProvider>
);
