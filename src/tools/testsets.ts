import { readdirSync, statSync, createWriteStream, createReadStream } from "fs";
import { resolve } from "path";
import chalk = require("chalk");
import unzipper = require("unzipper");
import * as vscode from "vscode";
import { SessionTreeItem } from "../providers/SessionTreeItem";
import * as path from "path";

async function getDownloadFolderPath(context: vscode.ExtensionContext) {
	let downloadsFolder = context.globalState.get<string | undefined>("downloadsFolder", undefined);

	// Ask for download folders if not specified
	if (!downloadsFolder) {
		let result = await vscode.window.showOpenDialog({
			title: "Select download folder",
			canSelectFolders: true,
			canSelectFiles: false,
			canSelectMany: false
		});

		if (!result || result.length == 0) return;

		downloadsFolder = result[0].fsPath;
		context.globalState.update("downloadsFolder", downloadsFolder);
	}

	return downloadsFolder;
}

export async function fetchExamples(session: SessionTreeItem, context: vscode.ExtensionContext) {
	const downloadsFolder = await getDownloadFolderPath(context);
	let options: { name: string, creation: number }[] = [];

	if (!downloadsFolder) return;

	// Find all zip possible options in the download folder
	readdirSync(downloadsFolder).forEach(file => {
		// Only consider zip files
		if (file.endsWith(".zip")) {
			const path = downloadsFolder + "/" + file;
			options.push({
				name: file,
				creation: statSync(path).birthtimeMs
			})
		}
	});

	options.sort((a, b) => b.creation - a.creation);

	const fileName = await vscode.window.showQuickPick(options.map(it => it.name));

	if (fileName) {
		const settings = await session.settings();
		// TODO const { clearSets } = await inquirer.prompt([clearSetsQuestion]);
		const inputRegex = new RegExp(settings.inputFilePattern!);
		const outputRegex = new RegExp(settings.outputFilePattern!);

		//if (clearSets) {
			// TODO clear
		//}

		let count = 0;

		await createReadStream(resolve(downloadsFolder + "/" + fileName))
			.pipe(unzipper.Parse())
			.on('entry', (entry) => {
				const fileName = entry.path as string;
				const file = entry.type === 'File'; // 'Directory' or 'File'
				let match: RegExpMatchArray | null;

				if (file &&  (match = fileName.match(inputRegex)) !== null) {
					entry.pipe(createWriteStream(
						resolve(path.join(session.path.fsPath, `inputs/input${parseInt(match[1])}.txt`))
					));

					count ++;
				} else if (file &&  (match = fileName.match(outputRegex)) !== null) {
					entry.pipe(createWriteStream(
						resolve(path.join(session.path.fsPath, `outputs/output${parseInt(match[1])}.txt`))
					));
				} else {
					entry.autodrain();
				}
			})
			.on("close", () => { console.log(chalk.gray(`${ count } tests copied from ${ fileName } !`)) })
			.promise();
	}
}