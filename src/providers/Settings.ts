import * as path from "path";
import * as fs from "fs";
import chalk = require("chalk");
import * as vscode from "vscode";

const SETTINGS_FILE = "settings.json";

export interface SessionSettings {
	importSets?: boolean;
	inputFilePattern?: string;
	outputFilePattern?: string;
}

export function loadSettings(sessionPath: string): SessionSettings {
	return JSON.parse(
		fs.readFileSync(path.join(sessionPath, SETTINGS_FILE)).toString()
	);
}

export function saveSettings(sessionPath: string, data: SessionSettings) {
	return fs.promises.writeFile(
		path.join(sessionPath, SETTINGS_FILE),
		JSON.stringify(data, null, 4)
	).then(() => {
		vscode.window.showInformationMessage("Session settings saved !");
	}).catch(err => {
		vscode.window.showErrorMessage("Error saving settings, session will not restore correctly...");
		console.error(err);
	});
}