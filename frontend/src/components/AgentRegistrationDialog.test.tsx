import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AgentRegistrationDialog } from "./AgentRegistrationDialog.tsx";

const mockCreateAgent = vi.hoisted(() => vi.fn());
const mockExistsAgentByName = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  createAgent: mockCreateAgent,
  existsAgentByName: mockExistsAgentByName,
}));

describe("AgentRegistrationDialog", () => {
  beforeEach(() => {
    mockCreateAgent.mockClear();
    mockCreateAgent.mockResolvedValue({});
    mockExistsAgentByName.mockClear();
    mockExistsAgentByName.mockResolvedValue(false);
  });

  test("에이전트 등록 타이틀이 보인다", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );

    expect(
      screen.getByRole("heading", { name: "에이전트 등록" }),
    ).toBeInTheDocument();
  });

  test("에이전트 이름, 설명, 시스템 프롬프트 폼이 보인다", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );

    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "설명" })).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toBeInTheDocument();
  });

  test("저장 버튼이 보인다", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );

    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  test("X 버튼이 보인다", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  test("초기 상태에서 저장 버튼이 비활성화 상태이다.", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );

    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("이름만 입력하면 저장 버튼이 비활성화 상태이다.", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "테스트 에이전트",
    );

    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("프롬프트만 입력하면 저장 버튼이 비활성화 상태이다.", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
      "테스트 프롬프트",
    );

    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("이름과 프롬프트를 모두 입력하면 저장 버튼이 활성화 상태이다.", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "테스트 에이전트",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
      "테스트 프롬프트",
    );

    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
  });

  test("저장 버튼을 클릭하면 다이얼로그가 닫힌다.", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "테스트 에이전트",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
      "테스트 시스템 프롬프트",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("X 버튼을 클릭하면 다이얼로그가 닫힌다", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("저장 버튼을 클릭하면 에이전트 정보를 저장할 수 있다", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "테스트 에이전트",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
      "테스트 시스템 프롬프트",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockCreateAgent).toHaveBeenCalledWith({
      name: "테스트 에이전트",
      system_prompt: "테스트 시스템 프롬프트",
    });
  });

  test("어떤 값을 입력 후 저장 버튼을 클릭 후 다시 열면 입력 값이 초기화되어 있다", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "테스트 에이전트",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
      "테스트 시스템 프롬프트",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );

    expect(screen.getByRole("textbox", { name: "에이전트 이름" })).toHaveValue(
      "",
    );
    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toHaveValue("");
  });

  test("어떤 값을 입력 후 X 버튼을 클릭 후 다시 열면 입력 값이 초기화되어 있다", async () => {
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "테스트 에이전트",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
      "테스트 시스템 프롬프트",
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );

    expect(screen.getByRole("textbox", { name: "에이전트 이름" })).toHaveValue(
      "",
    );
    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toHaveValue("");
  });

  test("중복된 이름 입력 시 안내 문구가 표시된다", async () => {
    mockExistsAgentByName.mockResolvedValue(true);
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "기존 에이전트",
    );

    expect(
      await screen.findByText("동일한 이름의 에이전트가 존재합니다."),
    ).toBeInTheDocument();
  });

  test("중복된 이름 입력 시 저장 버튼이 비활성화된다", async () => {
    mockExistsAgentByName.mockResolvedValue(true);
    render(<AgentRegistrationDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 등록" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "기존 에이전트",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
      "테스트 프롬프트",
    );

    expect(await screen.findByRole("button", { name: "저장" })).toBeDisabled();
  });
});
