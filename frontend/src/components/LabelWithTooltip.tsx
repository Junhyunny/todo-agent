import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

export const DESCRIPTION_TOOLTIP =
  "에이전트가 어떤 키워드에 실행되는지, 어떤 동작을 수행할지 간략히 적어주세요.";
export const SYSTEM_PROMPT_TOOLTIP =
  "에이전트가 어떤 동작을 수행해야 할지 구체적으로 적어주세요.";

export const LabelWithTooltip = ({
  htmlFor,
  label,
  tooltipLabel,
  tooltipContent,
}: {
  htmlFor: string;
  label: string;
  tooltipLabel: string;
  tooltipContent: ReactNode;
}) => {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      <Tooltip>
        <TooltipTrigger aria-label={tooltipLabel} closeOnClick={false}>
          <CircleHelp size={16} />
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </div>
  );
};
