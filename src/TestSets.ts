import { readdirSync, statSync, createWriteStream, createReadStream } from "fs";
import { resolve } from "path";
import unzipper = require("unzipper");
import * as vscode from "vscode";
import { SessionSettings } from "./providers/Settings";
import * as path from "path";
import { ProblemTreeItem, TestTreeItem } from "./providers/ProblemProvider";

import * as childProcess from "child_process";

const { fs } = vscode.workspace; 

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

export async function fetchExamples(settings: SessionSettings, problem: ProblemTreeItem, context: vscode.ExtensionContext) {
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
		const clearSets = await vscode.window.showQuickPick(["Yes", "No"], { 
			placeHolder: "Do you wish to clear previous test sets"
		});
		const inputRegex = new RegExp(settings.inputFilePattern!);
		const outputRegex = new RegExp(settings.outputFilePattern!);

		const { inputsDir, outputsDir } = problem

		if (clearSets === "Yes") {
			await fs.delete(inputsDir, { recursive: true });
			await fs.delete(outputsDir, { recursive: true });

			await fs.createDirectory(inputsDir)
			await fs.createDirectory(outputsDir)
		}

		let count = 0;

		await createReadStream(resolve(downloadsFolder + "/" + fileName))
			.pipe(unzipper.Parse())
			.on('entry', (entry) => {
				const fileName = entry.path as string;
				const file = entry.type === 'File'; // 'Directory' or 'File'
				let match: RegExpMatchArray | null;

				if (file && (match = fileName.match(inputRegex)) !== null) {
					entry.pipe(createWriteStream(
						resolve(path.join(inputsDir.fsPath, `${parseInt(match[1])}`))
					));

					count ++;
				} else if (file && (match = fileName.match(outputRegex)) !== null) {
					entry.pipe(createWriteStream(
						resolve(path.join(outputsDir.fsPath, `${parseInt(match[1])}`))
					));
				} else {
					entry.autodrain();
				}
			})
			.on("close", () =>
				vscode.window.showInformationMessage(`${ count } tests copied from ${ fileName } !`)
			)
			.promise();
	}
}


function runLoadedTest(test: TestTreeItem, programPath: string): Promise<{ success: boolean, diffs?: any[] }> {
	return new Promise((res, rej) => {
		const process = childProcess.spawn("node", [programPath]);
		let output = "";

		process.stdout?.on("data", (data) => {
			output += data;	
		});
		process.stdout?.on("close", () => {
			if (!test.output || output === test.output) {
				res({ success: true });
			}

			else {
				// TODO diff
				res({ success: false, diffs: [output, test.output] });
			}
		});

		process.stderr?.on("data", (data) => {
			console.log(data)
		});

		process.stdin?.write(test.input);
		process.stdin?.end();
	})
}

export async function runTests(problem: ProblemTreeItem) {
	const tests = await problem.getTests();
	const programPath = vscode.Uri.joinPath(problem.path, "local.js").fsPath;

	for (let key in tests) {
		const result = await runLoadedTest(tests[key], programPath);
		console.log(result);
	}
	
}


export async function runTest(problem: TestTreeItem) {
	const programPath = vscode.Uri.joinPath(problem.parent.path, "local.js").fsPath;

	return await runLoadedTest(problem, programPath);
}