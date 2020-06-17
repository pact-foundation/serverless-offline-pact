
export interface PactOptions {
  filePath: string;
  port?: number | string | null;
  host?: string | null;
  logLevel?: logLevel
  brokerUsername?: string | null;
  brokerPassword?: string | null;
  cors?: boolean | null;
  ssl?: boolean | null;
  brokerToken?: string | null;
  sslCertPath?: string | null;
  sslKeyPath?: string | null;
}


export interface PactLaunchOptions {
  filePath: string;
  port?: number | string | null;
  host?: string | null;
  logLevel?: logLevel
  brokerUsername?: string | null;
  brokerPassword?: string | null;
  cors?: boolean | null;
  ssl?: boolean | null;
  brokerToken?: string | null;
  sslCertPath?: string | null;
  sslKeyPath?: string | null;
}

type logLevel = "DEBUG"| "INFO" |"WARN"| "ERROR"

export interface PactConfig {
  stub: PactStubConfig;
}

interface PactStubConfig extends PactLaunchOptions {
  stages?: string[];
  noStart?: boolean | null;
}
