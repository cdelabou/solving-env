import figlet = require("figlet");
import inquirer = require("inquirer");
import chalk = require("chalk");
import unzipper = require("unzipper");
import clear = require("clear");

import { resolve } from "path";
import { existsSync, readFileSync, writeFile, mkdirSync, copyFileSync, readdirSync, statSync, createReadStream } from "fs";

import { sessionNameQuestion, setupQuestionFactory, whichZipQuestionFactory, clearSetsQuestion } from "./questions";


clear();

console.log(chalk.yellow(
	figlet.textSync("cp-ts")
))

interface Settings {
	importSets: boolean;
	currentProblem: number;
}
interface GlobalConfig {
	downloadsFolder: string;
}

const config: GlobalConfig = {
	downloadsFolder: "/mnt/c/Users/clebo/Downloads"
}

const defaultSetups: {[name: string]: Settings } = {
	"battledev": {
		importSets: true,
		currentProblem: 0
	},
	"coding-battle": {
		importSets: false,
		currentProblem: 0
	}
}
const SETTINGS_FILE = "setup.json";

class Session {
	private settings: Settings | undefined;

	constructor(private sessionName: string, private globalConfig: GlobalConfig) { }

	async setup() {
		// If no settings done yet
		if (existsSync(this.realPath())) {
			console.log(chalk.cyan(`Resuming session ${this.sessionName}...`));
			this.load();
		} else {
			console.log(chalk.cyan(`Creating new session ${this.sessionName}...`));

			// Create directory
			mkdirSync(this.realPath(), { recursive: true });

			// Ask for settings
			const { setup } = await inquirer.prompt(
				[setupQuestionFactory(Object.keys(defaultSetups))]
			);

			// Save and write settings
			this.settings = defaultSetups[setup];

			await this.nextProblem();
			this.save();
		}
	}

	async nextProblem() {
		this.settings!.currentProblem += 1;

		// If the path problem does not exists yet
		if (!existsSync(this.problemPath())) {
			// Create all problem folders
			mkdirSync(this.problemPath("inputs"), { recursive: true });
			mkdirSync(this.problemPath("outputs"), { recursive: true });

			// Copy template
			copyFileSync("lib/template.ts", this.problemPath("index.ts"))
			
			if (this.settings?.importSets) {
				await this.fetchExamples();
			}
		}
	}

	async fetchExamples() {
		let options: { name: string, creation: number }[] = [];

		// Find all possible options
		readdirSync(this.globalConfig.downloadsFolder).forEach(file => {
			// Only consider zip files
			if (file.endsWith(".zip")) {
				const path = this.globalConfig.downloadsFolder + "/" + file;
				options.push({
					name: file,
					creation: statSync(path).birthtimeMs
				})
			}
		});

		options.push({ name: "Abort", creation: -1 });
		options.sort((a, b) => b.creation - a.creation);

		const { fileName } = await inquirer.prompt(
			[whichZipQuestionFactory(options.map(it => it.name))]
		);

		if (fileName != "Abort") {
			const { clearSets } = await inquirer.prompt([clearSetsQuestion]);

			if (clearSets) {
				// TODO clear
			}
			console.log(resolve(this.globalConfig.downloadsFolder + "/" + fileName), resolve(this.problemPath("inputs")))
			createReadStream(resolve(this.globalConfig.downloadsFolder + "/" + fileName))
				.pipe(unzipper.Extract({ path: resolve(this.problemPath("inputs")) }))
				.on("close", () => { console.log(chalk.gray(`Test copied from ${ fileName } !`)) });
		
			// TODO move proper file to proper directory depending on setup settings
		await inquirer.prompt(
			[whichZipQuestionFactory(options.map(it => it.name))]
		);
		}
	}

	save() {
		writeFile(
			this.realPath(SETTINGS_FILE), JSON.stringify(this.settings, null, 4),
			(err) => {
				if (err) {
					console.error("Error saving settings, next session will not restore correctly...");
				} else {
					console.log(chalk.gray("Settings saved !"))
				}
			}
		);
	}

	load() {
		// Load settings from disk
		this.settings = JSON.parse(
			readFileSync(this.realPath(SETTINGS_FILE)).toString()
		);
	}

	// Path utilities
	problemPath(file: string = "") { return this.realPath(`problem${ this.settings?.currentProblem }/` + file) }
	realPath(file: string = "") { return "./workspace/" + this.sessionName + "/" + file }
}

async function main() {
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