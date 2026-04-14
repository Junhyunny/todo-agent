import { render, screen } from "@testing-library/react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { App } from "./App.tsx";

describe("App", () => {
  afterEach(() => {
    window.location.hash = "";
  });

  test("기본 경로에서 MainWindow가 렌더링된다", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
  });
});
