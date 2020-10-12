import figlet = require("figlet");
import inquirer = require("inquirer");
import chalk = require("chalk");
import clear = require("clear");


import { sessionNameQuestion, setupQuestionFactory, whichZipQuestionFactory, clearSetsQuestion, actionNameQuestion } from "../tools/questions";
import { GlobalConfig } from "../tools/settings";
import { Session } from "../tools/session";



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


/**
 * Settings to retrieve
 * 
 * - specific setup (battle dev, coding battle, google truc)
 * - specific name (default given)
 */