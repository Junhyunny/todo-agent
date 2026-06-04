import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { markdownComponents } from "@/lib/markdown-components.tsx";
import { TodoStatusItem } from "./TodoStatusItem.tsx";

type Props = {
  status: string;
  result?: string | null;
};

export const AgentTaskResultDialog = ({ status, result }: Props) => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            aria-label="작업 결과 보기"
            className="flex items-center gap-2"
            type="button"
          />
        }
      >
        <TodoStatusItem status={status} message="작업 완료" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>작업 결과</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto break-words text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={markdownComponents}
          >
            {result ?? ""}
          </ReactMarkdown>
        </div>
        <DialogClose render={<Button variant="outline" />}>닫기</DialogClose>
      </DialogContent>
    </Dialog>
  );
};
