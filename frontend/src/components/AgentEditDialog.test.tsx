import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { withTooltipProvider } from "@/tests/withProviders.tsx";
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

const renderWithTooltip = (onSave = vi.fn()) =>
  render(
    withTooltipProvider(<AgentEditDialog agent={agent} onSave={onSave} />),
  );

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
    renderWithTooltip();
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  test("X 버튼을 클릭하면 다이얼로그가 닫힌다", async () => {
    renderWithTooltip();
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("다이얼로그를 열면 이름, 설명, 시스템 프롬프트 폼이 보인다", async () => {
    renderWithTooltip();
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
    renderWithTooltip();
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("textbox", { name: "에이전트 이름" })).toHaveValue(
      "테스트 에이전트",
    );
  });

  test("다이얼로그를 열면 시스템 프롬프트가 채워져 있다.", async () => {
    renderWithTooltip();
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toHaveValue("테스트 프롬프트");
  });

  test("다이얼로그를 열면 '에이전트 수정' 타이틀이 보인다.", async () => {
    renderWithTooltip();
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.getByRole("heading", { name: "에이전트 수정" }),
    ).toBeInTheDocument();
  });

  test("이름 입력 필드가 비활성화 상태이다.", async () => {
    renderWithTooltip();
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeDisabled();
  });

  test("저장 버튼을 클릭하면 updateAgent를 호출한다.", async () => {
    renderWithTooltip();
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    const promptInput = screen.getByRole("textbox", {
      name: "시스템 프롬프트",
    });
    await userEvent.clear(promptInput);
    await userEvent.type(promptInput, "변경된 테스트 프롬프트");
    await userEvent.type(
      screen.getByRole("textbox", { name: "설명" }),
      "테스트 설명",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockUpdateAgent).toHaveBeenCalledWith("1", {
      name: "테스트 에이전트",
      system_prompt: "변경된 테스트 프롬프트",
    });
  });

  test("저장 버튼을 클릭하면 onSave 콜백을 호출한다.", async () => {
    const onSave = vi.fn();
    renderWithTooltip(onSave);
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    await userEvent.type(
      screen.getByRole("textbox", { name: "설명" }),
      "테스트 설명",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onSave).toHaveBeenCalledOnce();
  });

  test("저장 버튼을 클릭하면 다이얼로그가 닫힌다.", async () => {
    renderWithTooltip();
    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    await userEvent.type(
      screen.getByRole("textbox", { name: "설명" }),
      "테스트 설명",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("도구 리스트", () => {
    test("도구 리스트 라벨과 콤보박스가 보인다", async () => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));

      expect(screen.getByText("도구 리스트")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("도구 리스트 콤보박스를 클릭하면 웹 검색(web search) 항목이 표시된다", async () => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));

      const comboboxInput = screen.getByRole("combobox");
      const chipsContainer = comboboxInput.closest(
        '[data-slot="combobox-chips"]',
      );
      expect(chipsContainer).toBeInTheDocument();
      await userEvent.click(chipsContainer as Element);

      expect(
        await screen.findByRole("option", { name: "웹 검색(web search)" }),
      ).toBeInTheDocument();
    });
  });

  test("X 버튼을 누른 후 다시 모달을 열면 이전 값이 보인다", async () => {
    renderWithTooltip();
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

  describe("설명 툴팁", () => {
    test("설명 라벨 옆에 물음표 아이콘이 보인다", async () => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));

      expect(
        screen.getByRole("button", { name: "설명 도움말" }),
      ).toBeInTheDocument();
    });

    test("물음표 아이콘을 클릭하면 툴팁 내용이 보인다", async () => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));
      await userEvent.click(
        screen.getByRole("button", { name: "설명 도움말" }),
      );

      expect(
        await screen.findByText(
          "에이전트가 어떤 키워드에 실행되는지, 어떤 동작을 수행할지 간략히 적어주세요.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("저장 버튼 활성화 조건", () => {
    test("다이얼로그를 열면 저장 버튼이 비활성화 상태이다", async () => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));

      expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
    });

    test.each([
      { clearField: "설명" },
      { clearField: "시스템 프롬프트" },
    ])("필수 필드($clearField)를 지우면 저장 버튼이 비활성화 상태이다", async ({
      clearField,
    }) => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));

      await userEvent.type(
        screen.getByRole("textbox", { name: "설명" }),
        "테스트 설명",
      );
      await userEvent.clear(screen.getByRole("textbox", { name: clearField }));

      expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
    });

    test("설명을 입력하면 저장 버튼이 활성화 상태이다", async () => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));

      await userEvent.type(
        screen.getByRole("textbox", { name: "설명" }),
        "테스트 설명",
      );

      expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    });
  });

  describe("시스템 프롬프트 툴팁", () => {
    test("시스템 프롬프트 라벨 옆에 물음표 아이콘이 보인다", async () => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));

      expect(
        screen.getByRole("button", { name: "시스템 프롬프트 도움말" }),
      ).toBeInTheDocument();
    });

    test("물음표 아이콘을 클릭하면 툴팁 내용이 보인다", async () => {
      renderWithTooltip();
      await userEvent.click(screen.getByRole("button", { name: "수정" }));
      await userEvent.click(
        screen.getByRole("button", { name: "시스템 프롬프트 도움말" }),
      );

      expect(
        await screen.findByText(
          "에이전트가 어떤 동작을 수행해야 할지 구체적으로 적어주세요.",
        ),
      ).toBeInTheDocument();
    });
  });
});
