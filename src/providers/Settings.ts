import { TextDecoder, TextEncoder } from "util";
import * as vscode from "vscode";

const fs = vscode.workspace.fs;

const SETTINGS_FILE = "settings.json";

export interface SessionSettings {
	importSets?: boolean;
	inputFilePattern?: string;
	outputFilePattern?: string;
	customInput?: boolean;
}

namespace Settings {
	export async function load(sessionPath: vscode.Uri) {
		const content = await fs.readFile(vscode.Uri.joinPath(sessionPath, SETTINGS_FILE));
		return JSON.parse(new TextDecoder("utf-8").decode(content)) as SessionSettings;
	}
	
	export function save(sessionPath: vscode.Uri, data: SessionSettings) {
		return fs.writeFile(vscode.Uri.joinPath(sessionPath, SETTINGS_FILE), new TextEncoder().encode(JSON.stringify(data, null, 4)));
	}

	let _configurations: null | { [name: string]: SessionSettings } = null;

	export async function configurations(context: vscode.ExtensionContext) {
		if (_configurations == null) {
			const configDir = vscode.Uri.joinPath(context.extensionUri, "resources", "configurations");
			const files = (await fs.readDirectory(configDir)).filter(it => it[1] === vscode.FileType.Directory);
			_configurations = {};

			for (let it of files) {
				const text = await fs.readFile(vscode.Uri.joinPath(configDir, it[0], SETTINGS_FILE))
				const content = JSON.parse(new TextDecoder("utf-8").decode(text));

				_configurations![it[0]] = content;
			}
		}

		return _configurations;
	}
}

export default Settings;
