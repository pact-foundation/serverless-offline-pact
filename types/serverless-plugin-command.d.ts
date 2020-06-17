export interface ServerlessPluginCommand {
  commands?: Record<string, ServerlessPluginCommand>;
  lifecycleEvents?: string[];
  options?: Record<
    string,
    {
      default?: any;
      required?: boolean;
      shortcut?: string;
      usage?: string;
    }
  >;
  usage?: string;
}
