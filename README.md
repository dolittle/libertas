# Libertas

[Libertas](https://en.wikipedia.org/wiki/Libertas) is the Roman goddess and personification of liberty.
This project is dedicated to getting data from data centric systems in an easy way into an Event Driven
Microservice oriented world.

## Getting started

Prerequisites:

* [NodeJS](https://nodejs.org)
* [Yarn](https://yarnpkg.com)
* [Docker](https://docker.com)

This repository leverages Yarn workspaces.

At the root of the repository, do the following from your terminal:

```shell
$ yarn
```

## Dolittle Runtime

Some of the Node-RED Nodes in this project is built to support the Dolittle Runtime.
In order to develop on these leveraging the [Testbench](./Testbench) for instance, you'll
have to have the runtime running with an appropriate storage for the events.

Within the [Environments](./Environments) folder you'll find a pre-configured environment
that can be used for this purpose in the form of a [Docker compose](https://docs.docker.com/compose/)
environment. By running the following in your terminal, you should have it all running:

```shell
$ ./mongo-and-runtime.sh
```

It configures a tenant with the necessary resources for it. The tenant id is: **c59abefd-f72a-4684-ad7f-dfdd2c466fec**.

## Building any of the Node-RED projects

Within the [./Source](./Source) folder there are [Node-RED](https://nodered.org)
projects, these can be built either using the Gulp tasks or through running the
watcher within each of the package folders.

Watch:

```shell
$ yarn start
```

If you prefer building explicitly, you can run:

```shell
$ yarn build
```

## Getting started with the Node-RED Nodes

From within the [./Testbench](./Testbench) folder, you should also run:

```shell
$ yarn
```

Then you can start the testbench in either a watch mode or a non watching mode.

Watch:

```shell
$ yarn start
```

The watch will watch for code changes in the [./Source](./Source) folder.
When you build any of the projects either through the watch functionality or the
explicit build, Node-RED will restart and load the packages.
