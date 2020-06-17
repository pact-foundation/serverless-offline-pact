# serverless-offline-pact

![David](https://img.shields.io/david/YOU54F/serverless-offline-pact.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/YOU54F/serverless-offline-pact.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/YOU54F/serverless-offline-pact.svg)
![npm](https://img.shields.io/npm/dw/serverless-offline-pact.svg)
![npm](https://img.shields.io/npm/dm/serverless-offline-pact.svg)
![npm](https://img.shields.io/npm/dy/serverless-offline-pact.svg)
![npm](https://img.shields.io/npm/dt/serverless-offline-pact.svg)
![NPM](https://img.shields.io/npm/l/serverless-offline-pact.svg)
![npm](https://img.shields.io/npm/v/serverless-offline-pact.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/YOU54F/serverless-offline-pact.svg)
![npm collaborators](https://img.shields.io/npm/collaborators/serverless-offline-pact.svg)

Serverless Framework Plugin to download and run a pact stub service with a user provided pact file

## Installation

To install with npm, run this in your service directory:

```bash
npm install --save-dev serverless-offline-pact
```

or yarn

```bash
yarn add serverless-offline-pact --dev
```

Then add this to your `serverless.yml`

```yml
plugins:
  - serverless-offline-pact
```

## How it works

The plugin downloads the official [pact standalone](https://github.com/pact-foundation/pact-ruby-standalone/) on Your Computer and allows the serverless-offline app to launch it.

- Start a stub service with the given pact file(s) or directories. 
- Pact URIs may be local file or directory paths, or HTTP.
- Include any basic auth details in the URL using the format https://USERNAME:PASSWORD@URI. 
- Where multiple matching interactions are found, the interactions will be sorted by response status, and the first one will be returned. 
- This may lead to some non-deterministic behaviour. If you are having problems with this, please raise it on the pact slack channel.
- Note that only versions 1 and 2 of the pact specification are currently fully supported. 
- Pacts using the v3 format may be used, however, any matching features added in v3 will currently be ignored.

## Configuration

To configure pact Offline, add a `pact` section like this to your `serverless.yml`:

```yml

plugins:
  - serverless-offline-pact

custom:
  pact:
    stub:
      stages: # Enables stub, based on stage parameter
        - dev
      filePath: 'pact.json'
```

And start serverless-offline in your usual way `serverless-offline start`

The above is the minimal set of options, the full options are below

```
custom:
  pact:
    stub:
      stages: # Enables stub, based on stage parameter
        - dev
      filePath: 'pact.json' # URI if broker params provided
      port: '9999' # Port on which to run the service
      host: 'localhost' # Host on which to bind the service Default: localhost
      logLevel: 'DEBUG' # Log level. Options are DEBUG INFO WARN ERROR Default: DEBUG
      brokerUsername: '' # Pact Broker basic auth username
      brokerPassword: '' # Pact Broker basic auth password
      brokerToken: '' # Pact Broker bearer token (can also be set using the PACT_BROKER_TOKEN environment variable)
      cors: true # Support browser security in tests by responding to OPTIONS requests and adding CORS headers to mocked responses
      ssl: false # Use a self-signed SSL cert to run the service over HTTPS
      sslCertPath: '' # Specify the path to the SSL cert to use when running the service over HTTPS
      sslKeyPath: '' # Specify the path to the SSL key to use when running the service over HTTPS
      noStart: true # Does not start pact. This option is useful if you already have a running instance of pact locally
```

## Pact Stub Service Features


- Start a stub service with the given pact file(s) or directories. 
- Pact URIs may be local file or directory paths, or HTTP.
- Include any basic auth details in the URL using the format https://USERNAME:PASSWORD@URI. 
- Where multiple matching interactions are found, the interactions will be sorted by response status, and the first one will be returned. 
- This may lead to some non-deterministic behaviour. If you are having problems with this, please raise it on the pact slack channel.
- Note that only versions 1 and 2 of the pact specification are currently fully supported. 
- Pacts using the v3 format may be used, however, any matching features added in v3 will currently be ignored.
