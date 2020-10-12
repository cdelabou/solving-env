import { GlobalConfig, SessionSettings, Settings } from "./settings";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import { fetchExamples } from "./testsets";
import chalk = require("chalk");

import * as vscode from "vscode";

const defaultAvailableSetups = {
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
};


export class Session {
	public settings: SessionSettings;

	constructor(private sessionName: string, public context: vscode.ExtensionContext, public rootPath: string) {
		this.settings = SessionSettings.from(sessionName, context);
	}

	exists() {
		return this.settings.valid;
	}

	async setup() {
		// If no settings done yet
		if (this.settings.valid) {
			console.log(chalk.cyan(`Resuming session ${this.sessionName}...`));
		}
	}

	async createSession() {
		const cancellation = new vscode.CancellationTokenSource();

		console.log(chalk.cyan(`Creating new session ${this.sessionName}...`));

		// Create directory
		mkdirSync(this.realPath(), { recursive: true });

		const setups = this.context.globalState.get<{ [name: string]: Settings }>("availableSetups", defaultAvailableSetups);

		// Ask for settings
		const result = await vscode.window.showQuickPick(Object.keys(setups).map(label => ({ label })), {
			placeHolder: "Setup to use for the session"
		}, cancellation.token);

		// Check for cancellation
		if (cancellation.token.isCancellationRequested || !result) {
			return;
		}

		// Save and write settings
		this.settings.d = setups[result.label];

		// Init next problem
		await this.nextProblem();

		// Update settings
		this.settings.update();
	}

	async nextProblem() {
		this.settings.d.currentProblem += 1;

		// If the path problem does not exists yet
		if (!existsSync(this.problemPath())) {
			// Create all problem folders
			mkdirSync(this.problemPath("inputs"), { recursive: true });
			mkdirSync(this.problemPath("outputs"), { recursive: true });

			// Copy template
			copyFileSync(this.context.extensionPath + "/resources/template.txt", this.problemPath("index.ts"))

			if (this.settings.d.importSets) {
				await fetchExamples(this, this.context);
			}
		}
	}


	// Path utilities
	problemPath(file: string = "") { return this.realPath(`problem${this.settings?.d.currentProblem}/` + file) }
	realPath(file: string = "") { return this.rootPath + "/workspace/" + this.sessionName + "/" + file }
}