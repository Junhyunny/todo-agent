import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AgentEditDialog } from "./AgentEditDialog.tsx";

const mockUpdateAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  updateAgent: mockUpdateAgent,
}));

const agent = {
  id: "1",
  name: "테스트 에이전트",
  system_prompt: "테스트 프롬프트",
};

describe("AgentEditDialog", () => {
  beforeEach(() => {
    mockUpdateAgent.mockClear();
    mockUpdateAgent.mockResolvedValue({
      id: "1",
      name: "테스트 에이전트",
      system_prompt: "테스트 프롬프트",
    });
  });

  test("X 버튼이 보인다", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  test("X 버튼을 클릭하면 다이얼로그가 닫힌다", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("다이얼로그를 열면 이름, 설명, 시스템 프롬프트 폼이 보인다", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "설명" })).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toBeInTheDocument();
  });

  test("다이얼로그를 열면 에이전트 이름이 채워져 있다.", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("textbox", { name: "에이전트 이름" })).toHaveValue(
      "테스트 에이전트",
    );
  });

  test("다이얼로그를 열면 시스템 프롬프트가 채워져 있다.", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toHaveValue("테스트 프롬프트");
  });

  test("다이얼로그를 열면 '에이전트 수정' 타이틀이 보인다.", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.getByRole("heading", { name: "에이전트 수정" }),
    ).toBeInTheDocument();
  });

  test("이름 입력 필드가 비활성화 상태이다.", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeDisabled();
  });

  test("저장 버튼을 클릭하면 updateAgent를 호출한다.", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    const promptInput = screen.getByRole("textbox", {
      name: "시스템 프롬프트",
    });
    await userEvent.clear(promptInput);
    await userEvent.type(promptInput, "변경된 테스트 프롬프트");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockUpdateAgent).toHaveBeenCalledWith("1", {
      name: "테스트 에이전트",
      system_prompt: "변경된 테스트 프롬프트",
    });
  });

  test("저장 버튼을 클릭하면 onSave 콜백을 호출한다.", async () => {
    const onSave = vi.fn();
    render(<AgentEditDialog agent={agent} onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onSave).toHaveBeenCalledOnce();
  });

  test("저장 버튼을 클릭하면 다이얼로그가 닫힌다.", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("X 버튼을 누른 후 다시 모달을 열면 이전 값이 보인다", async () => {
    render(<AgentEditDialog agent={agent} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    const promptInput = screen.getByRole("textbox", {
      name: "시스템 프롬프트",
    });
    await userEvent.clear(promptInput);
    await userEvent.type(promptInput, "변경된 테스트 프롬프트");

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toHaveValue("테스트 프롬프트");
  });
});
