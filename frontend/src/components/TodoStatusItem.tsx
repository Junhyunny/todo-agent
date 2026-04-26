import { Circle, CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { TodoStatus } from "@/types/enums.ts";

type Props = {
  status: string;
  message?: string;
};

export const TodoStatusItem = ({ status, message }: Props) => {
  return (
    <>
      {status === TodoStatus.COMPLETED ? (
        <>
          <CircleCheck aria-label="작업 완료" className="text-green-500" />
          {message && <span>{message}</span>}
        </>
      ) : status === TodoStatus.FAILED ? (
        <>
          <CircleX aria-label="에이전트 할당 실패" className="text-red-500" />
          {message && <span>{message}</span>}
        </>
      ) : status === TodoStatus.ASSIGNED ? (
        <>
          <LoaderCircle
            aria-label="에이전트 작업 중"
            className="animate-spin text-blue-500"
          />
          {message && <span>{message}</span>}
        </>
      ) : (
        <>
          <Circle aria-label="에이전트 할당 대기" className="text-gray-400" />
          {message && <span>{message}</span>}
        </>
      )}
    </>
  );
};
