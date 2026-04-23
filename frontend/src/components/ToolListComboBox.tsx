// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
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

type Props = {
  id: string;
  value: string[];
  onValueChange: (newValues: string[]) => void;
};

const TOOLS = ["웹 검색(web search)"] as const;

export const ToolListComboBox = ({ id, value, onValueChange }: Props) => {
  const anchor = useComboboxAnchor();
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
          {TOOLS.map((tool) => (
            <ComboboxItem key={tool} value={tool}>
              {tool}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
