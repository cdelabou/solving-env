import browserify = require("browserify");
import { env, Uri, window, workspace } from "vscode";
import { SessionTreeItem } from "./providers/SessionTreeItem";
import * as ts from "typescript";
import * as nativeFs from "fs";
import { TextEncoder } from "util";
import { ProblemTreeItem } from "./providers/ProblemProvider";

const { fs } = workspace;

function browserifyFile(fileUri: Uri) {
	const b = browserify();
	b.add(Uri.joinPath(fileUri, "..", "index.js").fsPath)
	
	const stream = b.bundle();
	let content = '';
	stream.on('data', (chunk) => content += chunk);

	return new Promise<string>((resolve) => {
		stream.on('end', () => resolve(content));
	});
}

async function writeLocalProgram(session: SessionTreeItem, problemPath: Uri) {
	const programOutput = await fs.readFile(Uri.joinPath(problemPath, "index.js"));
	const lineReturn = new TextEncoder().encode("\n");
	const localLib = await fs.readFile(Uri.joinPath(session.rootFolder, "lib/locallib.js"));
	const result = new Uint8Array(localLib.length + programOutput.length + lineReturn.length);

	result.set(localLib);
	result.set(lineReturn, localLib.length);
	result.set(programOutput, localLib.length + lineReturn.length);

	await fs.writeFile(Uri.joinPath(problemPath, "local.js"), result);
}

export async function bundle(session: SessionTreeItem, problem: ProblemTreeItem) {
	const problemPath = problem.path;
	const fileUri = Uri.joinPath(problemPath, "index.ts");

	problem.setIcon("building");

	const exists = await fs.stat(Uri.joinPath(problemPath, "index.js")).then(() => true, () => false);
	if (!exists) {
		window.showWarningMessage("Unable to locate output 'index.js', is 'tsc --watch' running?");
		return;
	}
	
	//const program = ts.createProgram([fileUri.fsPath, Uri.joinPath(session.rootFolder, "lib/locallib.ts").fsPath], { module: ts.ModuleKind.CommonJS });
	//program.emit();

	// Add content to the local runnable file (no bundle required for local version)
	await writeLocalProgram(session, problemPath);
	
	// Bundle to an export file
	const bundle = await browserifyFile(fileUri);
	await fs.writeFile(
		Uri.joinPath(problem.path, "export.js"),
		new TextEncoder().encode(bundle)
	);

	env.clipboard.writeText(bundle);
	window.showInformationMessage("Problem output copied to clipboard")

	problem.setIcon("done");
}

