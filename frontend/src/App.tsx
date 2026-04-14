// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { HashRouter, Route, Routes } from "react-router";
import { MainWindow } from "@/windows/MainWindow.tsx";

export const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<MainWindow />} />
    </Routes>
  </HashRouter>
);
