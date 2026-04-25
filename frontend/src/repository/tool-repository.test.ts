import { describe, expect, test, vi } from "vitest";
import { getTools } from "./tool-repository";

const mockGetToolsApiToolsGet = vi.hoisted(() => vi.fn());
vi.mock("../api/generated/agents", () => ({
  getFastAPI: () => ({
    getToolsApiToolsGet: mockGetToolsApiToolsGet,
  }),
}));

describe("tool-repository", () => {
  test("getTools는 GET /tools를 호출하고 툴 목록을 반환한다", async () => {
    const tools = [
      { id: "1", name: "웹 검색(web search)" },
      { id: "2", name: "코드 실행" },
    ];
    mockGetToolsApiToolsGet.mockResolvedValue({ data: tools });

    const result = await getTools();

    expect(result).toEqual(tools);
    expect(mockGetToolsApiToolsGet).toHaveBeenCalledTimes(1);
  });
});
