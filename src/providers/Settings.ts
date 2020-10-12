import chalk = require("chalk");
import { TextDecoder, TextEncoder } from "util";
import * as vscode from "vscode";

const fs = vscode.workspace.fs;

const SETTINGS_FILE = "settings.json";

export interface SessionSettings {
	importSets?: boolean;
	inputFilePattern?: string;
	outputFilePattern?: string;
}

export async function loadSettings(sessionPath: vscode.Uri) {
	const content = await fs.readFile(vscode.Uri.joinPath(sessionPath, SETTINGS_FILE));
	return JSON.parse(new TextDecoder("utf-8").decode(content)) as SessionSettings;
}

export function saveSettings(sessionPath: vscode.Uri, data: SessionSettings) {
	return fs.writeFile(vscode.Uri.joinPath(sessionPath, SETTINGS_FILE), new TextEncoder().encode(JSON.stringify(data, null, 4)))
		.then(
			() => vscode.window.showInformationMessage("Session settings saved !"),
			err => {
				vscode.window.showErrorMessage("Error saving settings, session will not restore correctly...");
				console.error(err);
			}
		);
}