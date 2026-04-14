import { AgentListDialog } from "@/components/AgentListDialog.tsx";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";

export const MainWindow = () => {
  return (
    <div>
      <AgentRegistrationDialog />
      <AgentListDialog />
    </div>
  );
};
