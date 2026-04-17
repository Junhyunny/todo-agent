import { AgentListSheet } from "@/components/AgentListSheet.tsx";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";
import { TodoRegistrationDialog } from "@/components/TodoRegistrationDialog.tsx";

export const MainWindow = () => {
  return (
    <div>
      <AgentRegistrationDialog />
      <AgentListSheet />
      <TodoRegistrationDialog />
    </div>
  );
};
