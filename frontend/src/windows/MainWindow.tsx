import { useCallback, useEffect, useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import { AgentListSheet } from "@/components/AgentListSheet.tsx";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";
import { TodoRegistrationDialog } from "@/components/TodoRegistrationDialog.tsx";
import { TodoStatusSheet } from "@/components/TodoStatusSheet.tsx";
import {
  deleteTodo,
  getTodos,
  reassignTodo,
} from "@/repository/todo-repository.ts";
import { TodoStatus } from "@/types/enums.ts";
import { sseHandler } from "@/utils/sse-handler.ts";

declare const __API_BASE_URL__: string;

const isRefetch = (type: string): boolean => {
  return (
    type === TodoStatus.ASSIGNED ||
    type === TodoStatus.COMPLETED ||
    type === TodoStatus.FAILED
  );
};

const isSyncFinished = (type: string): boolean => {
  return type === TodoStatus.COMPLETED || type === TodoStatus.FAILED;
};

export const MainWindow = () => {
  const [todos, setTodos] = useState<TodoResponse[]>([]);

  const fetchTodos = useCallback(async () => {
    const todos = await getTodos();
    setTodos(todos);
  }, []);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const assignOnMessage = useCallback(
    (todoId: string) =>
      sseHandler(
        `${__API_BASE_URL__}/api/todos/${todoId}/events`,
        async (e: MessageEvent) => {
          const data = JSON.parse(e.data) as { type: string };
          if (isRefetch(data.type)) {
            await fetchTodos();
            return isSyncFinished(data.type);
          }
          return false;
        },
      ),
    [fetchTodos],
  );

  const handleTodoDelete = useCallback(
    async (todoId: string) => {
      await deleteTodo(todoId);
      await fetchTodos();
    },
    [fetchTodos],
  );

  const handleReassign = useCallback(
    (todoId: string) => {
      reassignTodo(todoId).then(() => {
        void fetchTodos();
        assignOnMessage(todoId);
      });
    },
    [fetchTodos, assignOnMessage],
  );

  const handleTodoSave = useCallback(
    (todoId: string) => {
      void fetchTodos();
      assignOnMessage(todoId);
    },
    [fetchTodos, assignOnMessage],
  );

  return (
    <div className="flex flex-col h-screen">
      <section aria-label="버튼 영역" className="flex-none">
        <AgentRegistrationDialog />
        <AgentListSheet />
        <TodoRegistrationDialog onSave={handleTodoSave} />
      </section>
      <section aria-label="TODO 목록" className="flex-1 overflow-y-auto">
        {todos.map((todo) => (
          <TodoStatusSheet
            key={todo.id}
            todo={todo}
            onDelete={handleTodoDelete}
            onReassign={handleReassign}
          />
        ))}
      </section>
    </div>
  );
};
