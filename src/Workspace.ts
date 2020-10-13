import { ExtensionContext, Uri, window, workspace } from "vscode";

const term = window.createTerminal({ name: "Solvenv" });

export async function setupWorkspace(workspaceDir: Uri, context: ExtensionContext) {
	window.showInformationMessage("Setting up your workspace...");

	await workspace.fs.copy(
		Uri.joinPath(context.extensionUri, "resources/lib"),
		Uri.joinPath(workspaceDir, "lib"),
		{ overwrite: true }
	);

	await workspace.fs.copy(
		Uri.joinPath(context.extensionUri, "resources/workspace/package.json"),
		Uri.joinPath(workspaceDir, "package.json"),
		{ overwrite: true }
	);

	await workspace.fs.copy(
		Uri.joinPath(context.extensionUri, "resources/workspace/tsconfig.json"),
		Uri.joinPath(workspaceDir, "tsconfig.json"),
		{ overwrite: true }
	);

	term.show(true);
	term.sendText("npm install", true);
	term.sendText("tsc -w", true);

	window.showInformationMessage("Workspace has been configured !");

}

export function runWatch() {
	term.show(true);
	term.sendText("tsc -w", true);
}