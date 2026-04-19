export const sseHandler = (
  url: string,
  onMessage: (e: MessageEvent) => Promise<boolean>,
): EventSource => {
  const es = new EventSource(url);
  es.onmessage = async (e: MessageEvent) => {
    const result = await onMessage(e);
    if (result) {
      es.close();
    }
  };
  es.onerror = () => es.close();
  return es;
};
