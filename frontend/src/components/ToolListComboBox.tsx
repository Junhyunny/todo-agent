// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React, { useEffect, useMemo, useState } from "react";
import type { ToolResponse } from "@/api/generated/agents";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox.tsx";
import { getTools } from "@/repository/tool-repository";

type Props = {
  id: string;
  value: string[];
  onValueChange: (newValues: string[]) => void;
};

export const ToolListComboBox = ({ id, value, onValueChange }: Props) => {
  const anchor = useComboboxAnchor();
  const [tools, setTools] = useState<ToolResponse[]>([]);

  useEffect(() => {
    getTools().then(setTools);
  }, []);

  const toolMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const tool of tools) {
      map.set(tool.id, tool.name);
    }
    return map;
  }, [tools]);

  return (
    <Combobox
      multiple
      value={value}
      onValueChange={(value) => onValueChange(value)}
    >
      <ComboboxChips ref={anchor}>
        {value.map((toolId) => (
          <ComboboxChip key={toolId}>
            {toolMap.get(toolId) ?? "unknown tool"}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput id={id} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          {tools.map((tool) => (
            <ComboboxItem key={tool.id} value={tool.id}>
              {tool.name}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
