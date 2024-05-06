<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <br>EnergySHR agent
  <br>
</h1>

# Agent instances

The agent can be configured using several environment variables. Amongst these are variables to enable certain
functionalities of the agent.
The idea is that there are functions in this agent each listening to different ports

- The **OIDC** component: This component running on port 3001 by default, provides the OpenID Connect support. It is responsible for ensuring that users are authenticated using an OpenID Connect capable Identity provider.
- The **Headless web3** component: This component is running on port 2999 by default. It provides headless web3 wallet functionality. Meaning it signs transaction on behalf of (un)authenticated users


# Building and testing

## Docker

Docker images are provided in the `docker` folder for both the issuer and customer agents

You can run `docker compose up` to run an agent with both components in Docker. 

## From source

### Lerna

These module make use of Lerna for managing multiple packages. Lerna is a tool that optimizes the workflow around
managing multi-package repositories with git and pnpm.

### Build

The below command builds all packages for you using lerna

### Pnpm

To build the project [pnpm](https://www.npmjs.com/package/pnpm) is used. Do not confuse this package manager with the
more regular `npm`.

Install pnpm globally:

```shell
npm -g install pnpm
```

Install the dependencies of all the projects

```shell
pnpm install
```

Build the projects

```shell
pnpm build
```

#### Production commands
If you want to run this project in production, directly from the project, instead of using an NPM repo for this project, follow the below steps.

- Build the project according to the above steps first. This is needed because you will need to create the `dist` folders, and it needs the NodeJS and Typescript libraries during build.
- Remove the `node_modules` top-level folder, keep any `dist` folder, as that is where the built project is to be found. You can also run the command below (ignore the error about node_modules missing at the end)

```shell
pnpm run clean:modules
```
- Install modules without dev dependencies and also do it offline, since everything should already be available

```shell
pnpm run install:prod
# The above is the same as pnpm install --prod --offline
```


- Running the production installation

```shell
pnpm run start:prod
```

### Utility scripts

There are other utility scripts that help with development.

* `pnpm fix:prettier` - runs `prettier` to fix code style.

### Publish
Please note that currently the packages are marked as internal. Meaning they will not be published to an NPM repository!

There are scripts that can publish the following versions:

* `latest`
* `next`
* `unstable`

```shell
pnpm publish:[version]
```
