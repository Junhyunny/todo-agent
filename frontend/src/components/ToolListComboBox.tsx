// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React, { useEffect, useState } from "react";
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

  return (
    <Combobox multiple value={value} onValueChange={onValueChange}>
      <ComboboxChips ref={anchor}>
        {value.map((tool) => (
          <ComboboxChip key={tool}>{tool}</ComboboxChip>
        ))}
        <ComboboxChipsInput id={id} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          {tools.map((tool) => (
            <ComboboxItem key={tool.id} value={tool.name}>
              {tool.name}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
