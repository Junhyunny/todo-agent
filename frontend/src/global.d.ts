declare module "*.css" {}

interface Window {
  agentRegistration: {
    open: () => Promise<void>;
  };
}
