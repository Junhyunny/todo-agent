import { useEffect, useState } from "react";
import { existsAgentByName } from "@/repository/agent-repository.ts";

const DEBOUNCE_DELAY_MS = 300;

/**
 * 입력된 이름의 중복 여부를 디바운스하여 검사한다.
 * 타이핑이 멈춘 뒤 `DEBOUNCE_DELAY_MS`가 지나야 API를 한 번 호출하며,
 * 이름이 비면 검사하지 않고 false를 반환한다.
 */
export const useDuplicateAgentName = (name: string): boolean => {
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    if (!name) {
      setIsDuplicate(false);
      return;
    }

    let ignore = false;
    const timer = setTimeout(() => {
      existsAgentByName(name).then((exists) => {
        if (!ignore) {
          setIsDuplicate(exists);
        }
      });
    }, DEBOUNCE_DELAY_MS);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [name]);

  return isDuplicate;
};
