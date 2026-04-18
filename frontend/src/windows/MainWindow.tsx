import { useEffect, useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import { AgentListSheet } from "@/components/AgentListSheet.tsx";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";
import { TodoRegistrationDialog } from "@/components/TodoRegistrationDialog.tsx";
import { TodoStatusSheet } from "@/components/TodoStatusSheet.tsx";
import { getTodos } from "@/repository/todo-repository.ts";

export const MainWindow = () => {
  const [todos, setTodos] = useState<TodoResponse[]>([]);

  useEffect(() => {
    getTodos().then(setTodos);
  }, []);

  return (
    <div>
      <AgentRegistrationDialog />
      <AgentListSheet />
      <TodoRegistrationDialog onSave={() => getTodos().then(setTodos)} />
      {todos.map((todo) => (
        <TodoStatusSheet key={todo.id} todo={todo} />
      ))}
    </div>
  );
};
