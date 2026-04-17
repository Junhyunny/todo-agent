import { render, screen } from "@testing-library/react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { App } from "./App.tsx";

const mockGetAgents = vi.hoisted(() => vi.fn());
const mockCreateAgent = vi.hoisted(() => vi.fn());
const mockExistsAgentByName = vi.hoisted(() => vi.fn());
vi.mock("./repository/agent-repository", () => ({
  getAgents: mockGetAgents,
  createAgent: mockCreateAgent,
  existsAgentByName: mockExistsAgentByName,
}));

const mockGetTodos = vi.hoisted(() => vi.fn());
const mockCreateTodo = vi.hoisted(() => vi.fn());
vi.mock("./repository/todo-repository", () => ({
  getTodos: mockGetTodos,
  createTodo: mockCreateTodo,
}));

describe("App", () => {
  afterEach(() => {
    window.location.hash = "";
    mockGetAgents.mockReset();
    mockGetTodos.mockReset();
  });

  test("기본 경로에서 MainWindow가 렌더링된다", () => {
    mockGetAgents.mockResolvedValue([]);
    mockGetTodos.mockResolvedValue([]);
    render(<App />);
    expect(
      screen.getByRole("button", { name: "에이전트 등록" }),
    ).toBeInTheDocument();
  });
});
