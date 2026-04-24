import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip.tsx";

export const withTooltipProvider = (children: ReactNode) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};
