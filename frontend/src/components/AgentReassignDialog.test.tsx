import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test } from "vitest";
import { AgentReassignDialog } from "./AgentReassignDialog.tsx";

const failureReason = "적합한 에이전트를 찾지 못했습니다";

describe("AgentReassignDialog", () => {
  test("할당 실패 아이콘이 보인다", () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    expect(screen.getByLabelText("에이전트 할당 실패")).toBeInTheDocument();
  });

  test("할당 실패 아이콘을 클릭하면 에이전트 재할당 다이얼로그가 열린다", async () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("에이전트 다시 할당 타이틀이 보인다", async () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );

    expect(
      screen.getByRole("heading", { name: "에이전트 다시 할당" }),
    ).toBeInTheDocument();
  });

  test("할당 실패 이유 메시지가 보인다", async () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );

    expect(screen.getByText(failureReason)).toBeInTheDocument();
  });

  test("재할당 하시겠습니까? 메시지가 보인다", async () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );

    expect(screen.getByText("재할당 하시겠습니까?")).toBeInTheDocument();
  });

  test("확인 버튼이 보인다", async () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );

    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "확인" }),
    ).toBeInTheDocument();
  });

  test("다이얼로그 상단에 X 버튼이 보인다", async () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );

    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }),
    ).toBeInTheDocument();
  });

  test("X 버튼을 클릭하면 에이전트 재할당 다이얼로그가 닫힌다", async () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("에이전트 재할당 다이얼로그 외부 영역을 클릭하면 다이얼로그가 닫힌다", async () => {
    render(<AgentReassignDialog failureReason={failureReason} />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );
    await userEvent.click(document.body);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("할당 실패 이유가 없으면 이유 메시지가 보이지 않는다", async () => {
    render(<AgentReassignDialog />);

    await userEvent.click(
      screen.getByRole("button", { name: "에이전트 재할당" }),
    );

    expect(screen.getByText("재할당 하시겠습니까?")).toBeInTheDocument();
    expect(screen.queryByText(failureReason)).not.toBeInTheDocument();
  });
});
