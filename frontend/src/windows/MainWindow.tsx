import { useEffect, useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import { AgentListSheet } from "@/components/AgentListSheet.tsx";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";
import { TodoRegistrationDialog } from "@/components/TodoRegistrationDialog.tsx";
import { TodoStatusSheet } from "@/components/TodoStatusSheet.tsx";
import { getTodos } from "@/repository/todo-repository.ts";
import { sseHandler } from "@/utils/sse-handler.ts";

declare const __API_BASE_URL__: string;

export const refetchTodos = () => getTodos();

export const MainWindow = () => {
  const [todos, setTodos] = useState<TodoResponse[]>([]);

  useEffect(() => {
    getTodos().then(setTodos);
  }, []);

  const handleTodoSave = (todoId: string) => {
    getTodos().then(setTodos);
    sseHandler(`${__API_BASE_URL__}/api/todos/${todoId}/events`, async (e) => {
      const data = JSON.parse(e.data) as { type: string; agent_name: string };
      if (data.type !== "assigned") {
        return false;
      }
      getTodos().then(setTodos);
      return true;
    });
  };

  return (
    <div>
      <AgentRegistrationDialog />
      <AgentListSheet />
      <TodoRegistrationDialog onSave={handleTodoSave} />
      {todos.map((todo) => (
        <TodoStatusSheet key={todo.id} todo={todo} />
      ))}
    </div>
  );
};
