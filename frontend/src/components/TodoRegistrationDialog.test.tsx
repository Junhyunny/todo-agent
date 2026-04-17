import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test } from "vitest";
import { TodoRegistrationDialog } from "./TodoRegistrationDialog.tsx";

describe("TodoRegistrationDialog", () => {
  test("TODO 등록 버튼이 보인다", () => {
    render(<TodoRegistrationDialog />);

    expect(
      screen.getByRole("button", { name: "TODO 등록" }),
    ).toBeInTheDocument();
  });

  test("TODO 등록 버튼을 누르면 다이얼로그가 열린다", async () => {
    render(<TodoRegistrationDialog />);

    await userEvent.click(screen.getByRole("button", { name: "TODO 등록" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("다이얼로그를 열면 '해야할 일' 타이틀이 보인다", async () => {
    render(<TodoRegistrationDialog />);

    await userEvent.click(screen.getByRole("button", { name: "TODO 등록" }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "해야할 일" }),
    ).toBeInTheDocument();
  });

  test("다이얼로그를 열면 제목 입력 필드, 내용 입력 필드, 저장 버튼이 보인다", async () => {
    render(<TodoRegistrationDialog />);

    await userEvent.click(screen.getByRole("button", { name: "TODO 등록" }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("textbox", { name: "제목" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("textbox", { name: "내용" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "저장" }),
    ).toBeInTheDocument();
  });

  test("아무것도 입력하지 않으면 저장 버튼이 비활성화된다", async () => {
    render(<TodoRegistrationDialog />);

    await userEvent.click(screen.getByRole("button", { name: "TODO 등록" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "저장" })).toBeDisabled();
  });
});
