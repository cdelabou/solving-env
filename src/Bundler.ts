import browserify = require("browserify");
import { env, Uri, window, workspace } from "vscode";
import { SessionTreeItem } from "./providers/SessionTreeItem";
import { TextDecoder, TextEncoder } from "util";
import { ProblemTreeItem } from "./providers/ProblemProvider";

const { fs } = workspace;

export const EXPORT_INPUT_FILE = "export-input";
export const LOCAL_INPUT_FILE = "local-input";

function browserifyFile(fileUri: Uri) {
	const b = browserify();
	b.add(fileUri.fsPath)
	
	const stream = b.bundle();
	let content = '';
	stream.on('data', (chunk) => content += chunk);

	return new Promise<string>((resolve) => {
		stream.on('end', () => resolve(content));
	});
}

async function writeLocalProgram(session: SessionTreeItem, problemPath: Uri, defaultInput: Uint8Array) {
	const programOutput = await fs.readFile(Uri.joinPath(problemPath, "index.js"));
	const lineReturn = new TextEncoder().encode("\n");
	const result = new Uint8Array(defaultInput.length + programOutput.length + lineReturn.length);

	result.set(defaultInput);
	result.set(lineReturn, defaultInput.length);
	result.set(programOutput, defaultInput.length + lineReturn.length);

	await fs.writeFile(Uri.joinPath(problemPath, "local.js"), result);
}

async function writeExport(session: SessionTreeItem, problemPath: Uri, defaultInput: Uint8Array) {
	// Bundle to an export file
	const bundle = await browserifyFile(Uri.joinPath(problemPath, "index.js"));

	// Load input library
	const settings = await session.settings();
	const input = settings.customInput
		? await fs.readFile(Uri.joinPath(session.path, EXPORT_INPUT_FILE + ".js"))
		: defaultInput;
	
	// Join both
	const bundleEncoded = new TextEncoder().encode(bundle);
	const content = new Uint8Array(bundleEncoded.length + input.length);
	content.set(input);
	content.set(bundleEncoded, input.length);

	await fs.writeFile(
		Uri.joinPath(problemPath, "export.js"),
		content
	);

	return new TextDecoder().decode(input) + bundle;
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

	const inputContent = await fs.readFile(Uri.joinPath(session.path, LOCAL_INPUT_FILE + ".js"));

	// Add content to the local runnable file (no bundle required for local version)
	await writeLocalProgram(session, problemPath, inputContent);
	const bundle = await writeExport(session, problemPath, inputContent);

	env.clipboard.writeText(bundle);
	window.showInformationMessage("Problem output copied to clipboard")

	problem.setIcon("done");
}

