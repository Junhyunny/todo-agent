import { useCallback, useEffect, useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import { AgentListSheet } from "@/components/AgentListSheet.tsx";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";
import { TodoRegistrationDialog } from "@/components/TodoRegistrationDialog.tsx";
import { TodoStatusSheet } from "@/components/TodoStatusSheet.tsx";
import { deleteTodo, getTodos } from "@/repository/todo-repository.ts";
import { sseHandler } from "@/utils/sse-handler.ts";

declare const __API_BASE_URL__: string;

export const MainWindow = () => {
  const [todos, setTodos] = useState<TodoResponse[]>([]);

  const fetchTodos = useCallback(async () => {
    const todos = await getTodos();
    setTodos(todos);
  }, []);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const handleTodoDelete = useCallback(
    async (todoId: string) => {
      await deleteTodo(todoId);
      await fetchTodos();
    },
    [fetchTodos],
  );

  const handleTodoSave = (todoId: string) => {
    void fetchTodos();
    sseHandler(`${__API_BASE_URL__}/api/todos/${todoId}/events`, async (e) => {
      const data = JSON.parse(e.data) as { type: string; agent_name: string };
      if (
        data.type === "assigned" ||
        data.type === "completed" ||
        data.type === "failed"
      ) {
        await fetchTodos();
        return data.type === "completed" || data.type === "failed";
      }
      return false;
    });
  };

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
          />
        ))}
      </section>
    </div>
  );
};
