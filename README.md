# Libertas

## Getting started

Prerequisites:

* [NodeJS](https://nodejs.org)
* [Yarn](https://yarnpkg.com)

This repository leverages Yarn workspaces.

At the root of the repository, do the following from your terminal:

```shell
$ yarn
```

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