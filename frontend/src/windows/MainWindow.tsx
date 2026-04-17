import { AgentListSheet } from "@/components/AgentListSheet.tsx";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";

export const MainWindow = () => {
  return (
    <div>
      <AgentRegistrationDialog />
      <AgentListSheet />
    </div>
  );
};
