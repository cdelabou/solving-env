import figlet = require("figlet");
import inquirer = require("inquirer");
import chalk = require("chalk");
import clear = require("clear");


import { sessionNameQuestion, setupQuestionFactory, whichZipQuestionFactory, clearSetsQuestion } from "./cli/questions";
import { GlobalConfig } from "./cli/settings";
import { Session } from "./cli/session";



const config: GlobalConfig = {
	downloadsFolder: "/mnt/c/Users/clebo/Downloads",
	availableSetups: {
		"battledev": {
			importSets: true,
			inputFilePattern: "^.+?input([0-9]+)\\.txt$",
			outputFilePattern: "^.+?output([0-9]+)\\.txt$",
			currentProblem: 0
		},
		"coding-battle": {
			importSets: false,
			currentProblem: 0
		}
	}
}


async function main() {
	clear();
	
	console.log(chalk.yellow(figlet.textSync("cp-ts")));

	const { name } = await inquirer.prompt([sessionNameQuestion])

	const session = new Session(name, config);
	await session.setup();
}

main();

/**
 * Settings to retrieve
 * 
 * - specific setup (battle dev, coding battle, google truc)
 * - specific name (default given)
 */