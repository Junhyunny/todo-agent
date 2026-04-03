// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { Button } from "@/components/ui/button.tsx";

export const App = () => (
  <div>
    <h1 className="text-3xl font-bold underline">Hello world!</h1>
    <Button>click me</Button>
  </div>
);
