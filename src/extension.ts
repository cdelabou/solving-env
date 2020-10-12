// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Session } from './tools/session';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "solvenv" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableHW = vscode.commands.registerCommand('solvenv.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from SolvEnv!');
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableInit = vscode.commands.registerCommand('solvenv.init', async () => {
		const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

		if (!rootPath) {
			vscode.window.showErrorMessage("Your workspace does not contains any folder, please open one first.");
			return;
		}

		const name = await vscode.window.showInputBox({
			placeHolder: "New Session Name"
		});
		
		if (name) {
			const session = new Session(name, context, rootPath);

			if (session.exists()) {
				vscode.window.showErrorMessage(`A session named '${name}' already exists, please pick another name.`);
				return;
			}

			await session.createSession();
			vscode.window.showInformationMessage(`Session '${name}' has been create successfully.`);
		}

	});

	context.subscriptions.push(disposableHW, disposableInit);
}

// this method is called when your extension is deactivated
export function deactivate() {}
