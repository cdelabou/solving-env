import * as vscode from 'vscode';
import * as path from 'path';
import { PROBLEM_PREFIX } from './SessionProvider';
import { SessionTreeItem } from "./SessionTreeItem";
import { bundle } from '../Bundler';

export class ProblemTreeItem extends vscode.TreeItem {
	public readonly index: number;

	constructor(
		public readonly folderName: string,
		private sessionPath: vscode.Uri
	) {
		super("Problem " + folderName.split(PROBLEM_PREFIX)[1], vscode.TreeItemCollapsibleState.None);

		this.index = parseFloat(folderName.split(PROBLEM_PREFIX)[1]);
	}

	public get path() {
		return vscode.Uri.joinPath(this.sessionPath, this.folderName);
	}

	public setIcon(name: string) {
		this.iconPath = {
			light: path.join(__filename, '..', '..', '..', 'resources', 'light', name + '-black.svg'),
			dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', name + '-white.svg')
		}
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'session-black.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'session-white.svg')
	};
}

export class ProblemProvider implements vscode.TreeDataProvider<ProblemTreeItem> {
	private fileWatcher: vscode.FileSystemWatcher | undefined;

	constructor(public sessionItem: SessionTreeItem | null) { }

	getTreeItem(element: ProblemTreeItem): ProblemTreeItem {
		return element;
	}

	getChildren(element?: ProblemTreeItem): Thenable<ProblemTreeItem[]> {
		const item = this.sessionItem;

		// Root -> returns sessions names
		if (!element && item) {
			return item.problems();
		}

		return Promise.resolve([]);
	}

	private _onDidChangeTreeData: vscode.EventEmitter<ProblemTreeItem | undefined> = new vscode.EventEmitter<ProblemTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<ProblemTreeItem | undefined> = this._onDidChangeTreeData.event;

	changeSession(item: SessionTreeItem): void {
		this.sessionItem = item;
		this.resfresh();
		
		//this.fileWatcher?.dispose();
		//this.fileWatcher = vscode.workspace.createFileSystemWatcher("**/workspace/" + item.label + "/*/index.ts");
		//this.fileWatcher.onDidChange((uri) => {
		//	bundle(item, uri);
		//});
	}

	resfresh() {
		this._onDidChangeTreeData.fire(undefined);
	}
}
