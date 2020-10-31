import * as vscode from "vscode";

export class CatScratchEditorProvider implements vscode.CustomTextEditorProvider {
	resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
		const content = document.getText();
		webviewPanel.webview.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Test results</title>
				<style>
					.success { color: green; }
					.fail { color: red; }
				</style>
			</head>
			<body>
				${content}
			</body>
			</html>`
	}
}