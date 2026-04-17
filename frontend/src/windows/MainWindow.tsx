import { Circle } from "lucide-react";
import { useEffect, useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import { AgentListSheet } from "@/components/AgentListSheet.tsx";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";
import { TodoRegistrationDialog } from "@/components/TodoRegistrationDialog.tsx";
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
        <section key={todo.id} aria-label={`todo-${todo.id}`}>
          <span>{todo.title}</span>
          <Circle aria-label="대기 중" className="text-gray-400" />
        </section>
      ))}
    </div>
  );
};
