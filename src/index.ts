import { ChildProcess, spawn } from "child_process";
import { join } from "path";
import Serverless from "serverless";
import { ServerlessPluginCommand } from "../types/serverless-plugin-command";
import { PactLaunchOptions, PactConfig } from "../types/Pact";
import internal from "stream";
import { chunksToLinesAsync } from "@rauschma/stringio";

const PACT_LOCAL_PATH = join(__dirname, "../pact/bin");

class ServerlessOfflinePactPlugin {
  public readonly commands: Record<string, ServerlessPluginCommand>;
  public readonly hooks: Record<string, () => Promise<any>>;
  private PactConfig: PactConfig;
  private pactInstances: Record<string, ChildProcess> = {};

  public constructor(private serverless: Serverless) {
    this.commands = {};

    this.PactConfig = this.serverless.service?.custom?.Pact || {};

    this.hooks = {
      "before:offline:start:end": this.stopPact,
      "before:offline:start": this.startPact,
    };
  }

  private spawnPactProcess = async (options: PactLaunchOptions) => {
    // pact-stub-service PACT_URI ...
    //   -p, [--port=PORT]                        # Port on which to run the service
    //   -h, [--host=HOST]                        # Host on which to bind the service
    //                                            # Default: localhost
    //   -l, [--log=LOG]                          # File to which to log output
    //   -n, [--broker-username=BROKER_USERNAME]  # Pact Broker basic auth username
    //   -p, [--broker-password=BROKER_PASSWORD]  # Pact Broker basic auth password
    //   -k, [--broker-token=BROKER_TOKEN]        # Pact Broker bearer token (can also be set using the PACT_BROKER_TOKEN environment variable)
    //       [--log-level=LOG_LEVEL]              # Log level. Options are DEBUG INFO WARN ERROR
    //                                            # Default: DEBUG
    //   -o, [--cors=CORS]                        # Support browser security in tests by responding to OPTIONS requests and adding CORS headers to mocked responses
    //       [--ssl], [--no-ssl]                  # Use a self-signed SSL cert to run the service over HTTPS
    //       [--sslcert=SSLCERT]                  # Specify the path to the SSL cert to use when running the service over HTTPS
    //       [--sslkey=SSLKEY]                    # Specify the path to the SSL key to use when running the service over HTTPS

    //   Description:
    //   Start a stub service with the given pact file(s) or directories. Pact URIs may be local file or directory paths, or HTTP.
    //   Include any basic auth details in the URL using the format https://USERNAME:PASSWORD@URI. Where multiple matching
    //   interactions are found, the interactions will be sorted by response status, and the first one will be returned. This
    //   may lead to some non-deterministic behaviour. If you are having problems with this, please raise it on the pact-dev
    //   google group, and we can discuss some potential enhancements. Note that only versions 1 and 2 of the pact
    //   specification are currently fully supported. Pacts using the v3 format may be used, however, any matching features
    //   added in v3 will currently be ignored.

    const filePath = options.filePath ? options.filePath: 'pact.json'
    const port = options.port ? options.port.toString() : '9999'
    const host = options.host ? options.host : 'localhost'
    const logLevel = options.logLevel ? options.logLevel : 'DEBUG'
    const brokerUsername = options.brokerUsername ? options.brokerUsername : null
    const brokerPassword = options.brokerPassword ? options.brokerPassword : null
    const brokerToken = options.brokerToken ? options.brokerToken : null
    const cors = options.cors ? "CORS" : null
    const ssl = options.ssl ? options.ssl : null
    const sslCertPath = options.sslCertPath ? options.sslCertPath : null
    const sslKeyPath = options.sslKeyPath ? options.sslKeyPath : null

    const args = [`${PACT_LOCAL_PATH}/pact-stub-service`];

    args.push(`--log-level`);
    args.push(logLevel);
    args.push(`--host`);
    args.push(host);
    args.push(`--port`);
    args.push(port);
    if (brokerUsername && brokerPassword && brokerToken) {
      args.push(`--broker-username`)
      args.push(brokerUsername)
      args.push(`--broker-username`)
      args.push(brokerPassword)
      args.push(`--broker-username`)
      args.push(brokerToken)
    }
    // if (cors || ssl || sslCertPath || sslKeyPath){
    //   args.push(`-o`)
    if (cors){
      args.push(`--cors`)
      args.push(cors)
    }
    if (ssl){
      args.push(`--ssl`)
    }
    if (sslCertPath){
      args.push(`--sslcert`)
      args.push(sslCertPath)
    }
    if (sslKeyPath){
      args.push(`--sslkey`)
      args.push(sslKeyPath)
    }
    // }

    args.push(filePath);

    const proc = spawn("/bin/sh", ["-c", args.join(" ")]);
    const startupLog: string[] = [];
    const started = await this.waitForStart(proc.stdout, startupLog);

    if (proc.pid == null || !started) {
      throw new Error("Unable to start the Pact Local process");
    }

    proc.on("error", (error) => {
      throw error;
    });

    this.pactInstances[port] = proc;

    (([
      "beforeExit",
      "exit",
      "SIGINT",
      "SIGTERM",
      "SIGUSR1",
      "SIGUSR2",
      "uncaughtException",
    ] as unknown) as NodeJS.Signals[]).forEach((eventType) => {
      process.on(eventType, () => {
        this.killPactProcess(this.PactConfig.stub);
      });
    });

    return { proc, port, host, filePath,startupLog};
  };

  private waitForStart = async (
    readable: internal.Readable,
    startupLog: string[],
  ) => {
    let started = false;
    for await (const line of chunksToLinesAsync(readable)) {
      startupLog.push(line);
      if (line.includes("WEBrick::HTTPServer#start: pid=")) {
        return (started = true);
      }
    }
    return started;
  };

  private killPactProcess = (options: PactLaunchOptions) => {
    const port = options.port ? options.port.toString() : 9999

    if (this.pactInstances[port] != null) {
      this.pactInstances[port].kill("SIGKILL");
      delete this.pactInstances[port];
    }
  };

  private shouldExecute = () => {
    if (
      this.PactConfig.stub.stages &&
      this.PactConfig.stub.stages.includes(this.serverless.service.provider.stage)
    ) {
      return true;
    }
    return false;
  };

  private startPact = async () => {
    if (this.PactConfig.stub.noStart || !this.shouldExecute()) {
      this.serverless.cli.log(
        "Pact Offline - [noStart] options is true. Will not start.",
      );
      return;
    }

    const { port, proc,host,filePath,startupLog } = await this.spawnPactProcess(this.PactConfig.stub);

    proc.on("close", (code) => {
      this.serverless.cli.log(
        `Pact Offline - Failed to start with code ${code}`,
      );
    });

    this.serverless.cli.log(
      `Pact Offline - Loaded ${filePath}, visit: http://${host}:${port}`,
    );

    this.serverless.cli.log(
      `Loaded interactions ${startupLog}`,
    );

    await Promise.resolve();
  };

  private stopPact = async () => {
    this.killPactProcess(this.PactConfig.stub);
    this.serverless.cli.log("Pact Offline - Stopped");
  };
}

export = ServerlessOfflinePactPlugin;
