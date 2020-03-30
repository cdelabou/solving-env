import { writeFile, readFileSync } from "fs";
import { Session } from "./session";
import chalk = require("chalk");

interface Settings {
	importSets?: boolean;
	currentProblem: number;
	inputFilePattern?: string;
	outputFilePattern?: string;
}

export interface GlobalConfig {
	downloadsFolder: string;
	availableSetups: { [name: string]: Settings }
}

const SETTINGS_FILE = "setup.json";

export class SessionSettings {
	public d: Settings = { currentProblem: 0 };

	constructor(private session: Session) { }

	/**
	 * Save settings
	 */
	save() {
		writeFile(
			this.session.realPath(SETTINGS_FILE), JSON.stringify(this.d, null, 4),
			(err) => {
				if (err) {
					console.error("Error saving settings, next session will not restore correctly...");
				} else {
					console.log(chalk.gray("Settings saved !"))
				}
			}
		);
	}

	/**
	 * Load settings
	 */
	load() {
		// Load settings from disk
		this.d = JSON.parse(
			readFileSync(this.session.realPath(SETTINGS_FILE)).toString()
		);
	}

}