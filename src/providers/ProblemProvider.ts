import * as vscode from 'vscode';
import * as path from 'path';
import { PROBLEM_PREFIX } from './SessionProvider';
import { SessionTreeItem } from "./SessionTreeItem";

export class ProblemTreeItem extends vscode.TreeItem {
	public readonly index: number;

	constructor(
		public readonly folderName: string,
		private sessionPath: string
	) {
		super("Problem " + folderName.split(PROBLEM_PREFIX)[1], vscode.TreeItemCollapsibleState.None);

		this.index = parseFloat(folderName.split(PROBLEM_PREFIX)[1]);
	}

	public get path() {
		return path.join(this.sessionPath, this.folderName);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'session-black.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'session-white.svg')
	};
}

export class ProblemProvider implements vscode.TreeDataProvider<ProblemTreeItem> {
	constructor(public sessionItem: SessionTreeItem | null) { }

	getTreeItem(element: ProblemTreeItem): ProblemTreeItem {
		return element;
	}

	getChildren(element?: ProblemTreeItem): Thenable<ProblemTreeItem[]> {
		const item = this.sessionItem;

		// Root -> returns sessions names
		if (!element && item) {
			return Promise.resolve(item.problems)
		}

		return Promise.resolve([]);
	}

	private _onDidChangeTreeData: vscode.EventEmitter<ProblemTreeItem | undefined> = new vscode.EventEmitter<ProblemTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<ProblemTreeItem | undefined> = this._onDidChangeTreeData.event;

	changeSession(item: SessionTreeItem): void {
		this.sessionItem = item;
		this.resfresh();
	}

	resfresh() {
		this._onDidChangeTreeData.fire(undefined);
	}
}
