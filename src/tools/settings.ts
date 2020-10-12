import chalk = require("chalk");
import { ExtensionContext } from "vscode";

export interface Settings {
	importSets?: boolean;
	currentProblem: number;
	inputFilePattern?: string;
	outputFilePattern?: string;
}

export interface GlobalConfig {
	downloadsFolder: string;
	availableSetups: { [name: string]: Settings }
}

export class SessionSettings {
	public d: Settings = { currentProblem: 0 };
	public valid: boolean = false;

	constructor(private sessionName: string, public context: ExtensionContext) {
		const data = this.context.workspaceState.get("session." + sessionName, null);
		if (data != null) {
			this.d = data;
			this.valid = true;
		}
	}

	/**
	 * Save settings and mark session as valid
	 */
	update() {
		this.context.workspaceState.update("session." + this.sessionName, this.d);
		this.valid = true;
		console.log(chalk.gray("Settings saved !"))
	}
	
	static from(sessionName: string, context: ExtensionContext) {
		return new SessionSettings(sessionName, context);
	}
}