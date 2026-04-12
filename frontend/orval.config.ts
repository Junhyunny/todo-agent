import { defineConfig } from "orval";

export default defineConfig({
  agents: {
    input: "../spec/openapi.json",
    output: {
      mode: "single",
      target: "./src/api/generated/agents.ts",
      client: "axios",
    },
  },
});
