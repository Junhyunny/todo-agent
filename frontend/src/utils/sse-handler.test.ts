import { beforeEach, describe, expect, test, vi } from "vitest";
import { sseHandler } from "@/utils/sse-handler.ts";

const capturedEventSources: MockEventSource[] = [];

class MockEventSource {
  url: string;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    capturedEventSources.push(this);
  }
}

describe("sseHandler", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource);
  });

  test("EventSource 객체에 필요한 엔드포인트가 올바르게 전달되는지 확인한다", () => {
    const eventSource = sseHandler("http://localhost:8000/api/sse", vi.fn());
    expect(eventSource.url).toEqual("http://localhost:8000/api/sse");
  });

  test("이벤트 메시지가 수신될 때 onmessage 핸들러가 올바르게 호출된다", async () => {
    const spyOnMessage = vi.fn().mockResolvedValue(true);
    const eventSource = sseHandler(
      "http://localhost:8000/api/sse",
      spyOnMessage,
    );

    await eventSource?.onmessage?.({
      data: { type: "sample" },
    } as MessageEvent);

    expect(spyOnMessage).toHaveBeenCalledWith({ data: { type: "sample" } });
  });

  test("onmessage 핸들러가 정상적으로 완료되면 SSE 수신을 중단한다", async () => {
    const spyOnMessage = vi.fn().mockResolvedValue(true);
    const eventSource = sseHandler(
      "http://localhost:8000/api/sse",
      spyOnMessage,
    );

    await eventSource?.onmessage?.({
      data: { type: "sample" },
    } as MessageEvent);

    expect(eventSource.close).toHaveBeenCalled();
  });

  test("onmessage 핸들러가 완료되지 않으면 SSE 수신을 중단하지 않는다", async () => {
    const spyOnMessage = vi.fn().mockResolvedValue(false);
    const eventSource = sseHandler(
      "http://localhost:8000/api/sse",
      spyOnMessage,
    );

    await eventSource?.onmessage?.({
      data: { type: "sample" },
    } as MessageEvent);

    expect(eventSource.close).not.toHaveBeenCalled();
  });

  test("이벤트 메시지가 수신될 때 onerror 핸들러가 호출되면 해당 SSE 수신을 중단한다", () => {
    const spyOnMessage = vi.fn();
    const eventSource = sseHandler(
      "http://localhost:8000/api/sse",
      spyOnMessage,
    );

    // @ts-expect-error
    eventSource?.onerror?.();

    expect(eventSource.close).toHaveBeenCalled();
  });
});
