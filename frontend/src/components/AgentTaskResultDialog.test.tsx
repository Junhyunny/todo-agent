import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test } from "vitest";
import { TodoStatus } from "@/types/enums.ts";
import { AgentTaskResultDialog } from "./AgentTaskResultDialog.tsx";

const markdownResult = `# 할 일

- [x] 로그인 구현
- [ ] 결제 구현

| 기능 | 상태 |
|---|---|
| 로그인 | 완료 |
| 결제 | 진행중 |

~~삭제된 내용~~
`;

const openDialog = async () => {
  await userEvent.click(screen.getByRole("button", { name: "작업 결과 보기" }));
  return screen.getByRole("dialog");
};

describe("AgentTaskResultDialog", () => {
  test("작업 완료 아이콘을 클릭하면 작업 결과 다이얼로그가 열린다", async () => {
    render(
      <AgentTaskResultDialog
        status={TodoStatus.COMPLETED}
        result={markdownResult}
      />,
    );

    await openDialog();

    expect(
      screen.getByRole("heading", { name: "작업 결과" }),
    ).toBeInTheDocument();
  });

  test("마크다운 제목을 heading으로 렌더링한다", async () => {
    render(
      <AgentTaskResultDialog
        status={TodoStatus.COMPLETED}
        result={markdownResult}
      />,
    );

    const dialog = await openDialog();

    expect(
      within(dialog).getByRole("heading", { name: "할 일" }),
    ).toBeInTheDocument();
  });

  test("GFM 체크박스를 체크 상태와 함께 렌더링한다", async () => {
    render(
      <AgentTaskResultDialog
        status={TodoStatus.COMPLETED}
        result={markdownResult}
      />,
    );

    const dialog = await openDialog();

    const checkboxes = within(dialog).getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  test("GFM 표를 table로 렌더링한다", async () => {
    render(
      <AgentTaskResultDialog
        status={TodoStatus.COMPLETED}
        result={markdownResult}
      />,
    );

    const dialog = await openDialog();

    const table = within(dialog).getByRole("table");
    expect(
      within(table).getByRole("columnheader", { name: "기능" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("columnheader", { name: "상태" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: "로그인" }),
    ).toBeInTheDocument();
  });

  test("GFM 취소선 텍스트를 렌더링한다", async () => {
    render(
      <AgentTaskResultDialog
        status={TodoStatus.COMPLETED}
        result={markdownResult}
      />,
    );

    const dialog = await openDialog();

    expect(within(dialog).getByText("삭제된 내용")).toBeInTheDocument();
  });

  test("위험한 javascript 링크는 정상 링크로 렌더링되지 않는다", async () => {
    render(
      <AgentTaskResultDialog
        status={TodoStatus.COMPLETED}
        result="[클릭](javascript:alert('xss'))"
      />,
    );

    const dialog = await openDialog();

    expect(within(dialog).getByText("클릭")).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("link", { name: "클릭" }),
    ).not.toBeInTheDocument();
  });

  test("일반 https 링크는 링크로 렌더링한다", async () => {
    render(
      <AgentTaskResultDialog
        status={TodoStatus.COMPLETED}
        result="[문서](https://example.com)"
      />,
    );

    const dialog = await openDialog();

    expect(within(dialog).getByRole("link", { name: "문서" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });

  test("결과가 없어도 다이얼로그가 안전하게 열린다", async () => {
    render(
      <AgentTaskResultDialog status={TodoStatus.COMPLETED} result={null} />,
    );

    await openDialog();

    expect(
      screen.getByRole("heading", { name: "작업 결과" }),
    ).toBeInTheDocument();
  });

  test("닫기 버튼을 클릭하면 다이얼로그가 닫힌다", async () => {
    render(
      <AgentTaskResultDialog
        status={TodoStatus.COMPLETED}
        result={markdownResult}
      />,
    );

    const dialog = await openDialog();
    await userEvent.click(within(dialog).getByRole("button", { name: "닫기" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
