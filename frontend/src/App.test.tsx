import { render, screen } from "@testing-library/react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as agentRepository from "@/repository/agent-repository.ts";
import * as todoRepository from "@/repository/todo-repository.ts";
import { App } from "./App.tsx";

const mockGetAgents = vi.spyOn(agentRepository, "getAgents");
const mockCreateAgent = vi.spyOn(agentRepository, "createAgent");
const mockExistsAgentByName = vi.spyOn(agentRepository, "existsAgentByName");
const mockGetTodos = vi.spyOn(todoRepository, "getTodos");
const mockCreateTodo = vi.spyOn(todoRepository, "createTodo");

describe("App", () => {
  afterEach(() => {
    window.location.hash = "";
    mockGetAgents.mockReset();
    mockCreateAgent.mockReset();
    mockExistsAgentByName.mockReset();
    mockGetTodos.mockReset();
    mockCreateTodo.mockReset();
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
