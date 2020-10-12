import browserify = require("browserify");
import { Uri, workspace } from "vscode";
import { SessionTreeItem } from "./providers/SessionTreeItem";
import * as ts from "typescript";
import * as nativeFs from "fs";
import { TextEncoder } from "util";

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

async function writeLocalProgram(session: SessionTreeItem, fileUri: Uri) {
	const programOutput = await fs.readFile(Uri.joinPath(fileUri, "..", "index.js"));
	const lineReturn = new TextEncoder().encode("\n");
	const localLib = await fs.readFile(Uri.joinPath(session.rootFolder, "lib/locallib.js"));
	const result = new Uint8Array(localLib.length + programOutput.length + lineReturn.length);
	result.set(localLib);
	result.set(lineReturn, localLib.length);
	result.set(programOutput, localLib.length + lineReturn.length);

	fs.writeFile(Uri.joinPath(fileUri, "..", "local.js"), result);
}

export async function bundle(session: SessionTreeItem, fileUri: Uri) {
	const program = ts.createProgram([fileUri.fsPath, Uri.joinPath(session.rootFolder, "lib/locallib.ts").fsPath], { module: ts.ModuleKind.CommonJS });
	program.emit();

	// Add content to the local runnable file (no bundle required for local version)
	await writeLocalProgram(session, fileUri);
	
	// Bundle to an export file
	const bundle = await browserifyFile(fileUri);
	await fs.writeFile(
		Uri.joinPath(fileUri, "..", "export.js"),
		new TextEncoder().encode(bundle)
	);
}