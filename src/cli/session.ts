import { SessionSettings, GlobalConfig } from "./settings";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import { setupQuestionFactory } from "./questions";
import { fetchExamples } from "./testsets";
import inquirer = require("inquirer");
import chalk = require("chalk");


export class Session {
	public settings: SessionSettings;

	constructor(private sessionName: string, public globalConfig: GlobalConfig) {
		this.settings = new SessionSettings(this);
	 }

	async setup() {
		// If no settings done yet
		if (existsSync(this.realPath())) {
			console.log(chalk.cyan(`Resuming session ${this.sessionName}...`));
			this.settings.load();
		} else {
			console.log(chalk.cyan(`Creating new session ${this.sessionName}...`));

			// Create directory
			mkdirSync(this.realPath(), { recursive: true });

			// Ask for settings
			const { setup } = await inquirer.prompt(
				[setupQuestionFactory(Object.keys(this.globalConfig.availableSetups))]
			);

			// Save and write settings
			this.settings.d = this.globalConfig.availableSetups[setup];

			await this.nextProblem();
			this.settings.save();
		}
	}

	async nextProblem() {
		this.settings!.d.currentProblem += 1;

		// If the path problem does not exists yet
		if (!existsSync(this.problemPath())) {
			// Create all problem folders
			mkdirSync(this.problemPath("inputs"), { recursive: true });
			mkdirSync(this.problemPath("outputs"), { recursive: true });

			// Copy template
			copyFileSync("lib/template.ts", this.problemPath("index.ts"))
			
			if (this.settings?.d.importSets) {
				await fetchExamples(this);
			}
		}
	}


	// Path utilities
	problemPath(file: string = "") { return this.realPath(`problem${ this.settings?.d.currentProblem }/` + file) }
	realPath(file: string = "") { return "./workspace/" + this.sessionName + "/" + file }
}