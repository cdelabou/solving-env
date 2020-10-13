// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ProblemProvider, ProblemTreeItem } from './providers/ProblemProvider';
import { SessionProvider } from './providers/SessionProvider';
import { SessionTreeItem } from "./providers/SessionTreeItem";
import * as path from "path";
import { bundle } from './Bundler';
import { setupWorkspace } from './Workspace';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const sessionProvider = new SessionProvider(vscode.workspace.workspaceFolders![0].uri, context);
	const sessionTreeView = vscode.window.createTreeView('solvenv.sessions', {
		treeDataProvider: sessionProvider
	});

	const problemProvider = new ProblemProvider(null);
	const problemTreeView = vscode.window.createTreeView('solvenv.problems', {
		treeDataProvider: problemProvider
	});

	sessionTreeView.onDidChangeSelection((event) => {
		if (event.selection.length == 1) {
			const item = event.selection[0];
			problemTreeView.title = item.label;
			problemProvider.changeSession(item);
		}
	});

	problemTreeView.onDidChangeSelection((event) => {
		if (event.selection.length == 1) {
			const item = event.selection[0];
			const fileToEdit = vscode.Uri.joinPath(item.path, "index.ts");
			vscode.window.showTextDocument(fileToEdit);
		}
	})

	context.subscriptions.push(
		vscode.commands.registerCommand('solvenv.helloWorld', () => {
			// The code you place here will be executed every time your command is executed

			// Display a message box to the user
			vscode.window.showInformationMessage('Hello World from SolvEnv!');
		}),

		vscode.commands.registerCommand('solvenv.new_session', async () => {
			const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

			if (!rootPath) {
				vscode.window.showErrorMessage("Your workspace does not contains any folder, please open one first.");
				return;
			}

			const name = await vscode.window.showInputBox({
				placeHolder: "New Session Name"
			});

			if (name) {
				await sessionProvider.createNew(name);
				sessionProvider.refresh();
				vscode.window.showInformationMessage(`Session '${name}' has been created successfully.`);
			}

		}),

		vscode.commands.registerCommand('solvenv.new_problem', async () => {
			const selectedSession = problemProvider.sessionItem;

			if (!selectedSession) {
				vscode.window.showErrorMessage("Please select a session before adding problems.");
				return;
			}

			// Create new problem
			await selectedSession.newProblem();

			// Refresh
			problemProvider.resfresh();
		}),

		vscode.commands.registerCommand('solvenv.open_session', (item: SessionTreeItem) => {
			if (!item) {
				vscode.window.showWarningMessage(`No session specified, use the view on the left side of the editor instead.`);
				return;
			}

			problemTreeView.title = item.label;
			problemProvider.changeSession(item);
		}),

		vscode.commands.registerCommand('solvenv.build', async (item: ProblemTreeItem) => {
			if (!item) {
				vscode.window.showWarningMessage(`No problem specified, use the view on the left side of the editor instead.`);
				return;
			}

			await bundle(problemProvider.sessionItem!, item);
		}),

		vscode.commands.registerCommand('solvenv.refresh', () => sessionProvider.refresh()),

		vscode.commands.registerCommand('solvenv.init', () => setupWorkspace(vscode.workspace.workspaceFolders![0].uri, context))
	);


}

// this method is called when your extension is deactivated
export function deactivate() { }
