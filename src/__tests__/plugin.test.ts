import ServerlessOfflinePactPlugin from "../index";

const serverless: any = {
  getProvider: () => ({}),
};

describe("Serverless Plugin Pact Offline", () => {
  test("Should meet Serverless Plugin Interface", () => {
    const plugin = new ServerlessOfflinePactPlugin(serverless);
    expect(plugin.hooks).toEqual({
      "before:offline:start:end": expect.any(Function),
      "before:offline:start:init": expect.any(Function),
    });
  });
});
