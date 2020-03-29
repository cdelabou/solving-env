# Competitive programming TypeScript environment

This project contains an development environment enabling the write solutions using typescript and export them.

## Install

You should first install `node` and `npm`.

For now the tool is only compatible with linux. Installation script is provided with `install.sh` for `apt` based systems, otherwise adapt it to your system.

Your need to configure the project by creating a `config.sh` file, your can copy `config.sh.example` and specify your download folder. This is used to extract the downloaded test sets into a new problem.

## Creating a problem and running tests

First of all, you should download the test sets from your challenge site into the specified download folder.

Then run `init.sh [name]` with name being the name of the problem. A folder is created into workspace, you can open the index.ts file containing the default template for the problem.

When you want to test or export the solution, run `run.sh [name]`, an `export.js` file is created so you can export it to the competitive platform ! Don't worry, all the dependencies are wrapped into this file.