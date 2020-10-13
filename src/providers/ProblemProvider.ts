import * as vscode from 'vscode';
import * as path from 'path';
import { PROBLEM_PREFIX } from './SessionProvider';
import { SessionTreeItem } from "./SessionTreeItem";
import { TextDecoder } from 'util';

const { fs } = vscode.workspace;

export class ProblemTreeItem extends vscode.TreeItem {
	public readonly index: number;
	private _tests?: { [name: string]: TestTreeItem }

	constructor(
		public readonly folderName: string,
		private sessionPath: vscode.Uri
	) {
		super("Problem " + folderName.split(PROBLEM_PREFIX)[1], vscode.TreeItemCollapsibleState.Collapsed);

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

	public get inputsDir() {
		return vscode.Uri.joinPath(this.path, "inputs")
	}

	public get outputsDir() {
		return vscode.Uri.joinPath(this.path, "inputs")
	}

	public async reloadTests() {
		const { inputsDir, outputsDir } = this;

		const inputs = await fs.readDirectory(inputsDir);
		const outputs = (await fs.readDirectory(outputsDir))
			.filter(it => it[1] === vscode.FileType.File)
			.map(it => it[0]);

		this._tests = {};

		// Load all inputs
		for (let inputEntry of inputs.filter(it => it[1] === vscode.FileType.File)) {
			const input = await fs.readFile(vscode.Uri.joinPath(inputsDir, inputEntry[0]));

			this._tests[inputEntry[0]] = new TestTreeItem(inputEntry[0], new TextDecoder("utf-8").decode(input), this);

			// Add output if any
			if (outputs.includes(inputEntry[0])) {
				const output = await fs.readFile(vscode.Uri.joinPath(outputsDir, inputEntry[0]));

				this._tests[inputEntry[0]].output = new TextDecoder("utf-8").decode(output);
			}
		}
	}

	public async getTests() {
		if (!this._tests) {
			await this.reloadTests();
		}

		return this._tests!;
	}

	public async getTestArray() {
		const tests = await this.getTests();

		return Object.values(tests);
	}
}

export class TestTreeItem extends vscode.TreeItem {
	public output?: string;
	
	constructor(index: string, public readonly input: string, public readonly parent: ProblemTreeItem) {
		super("Test " + index, vscode.TreeItemCollapsibleState.None);
	}
}

type ProviderItem = ProblemTreeItem | TestTreeItem;

export class ProblemProvider implements vscode.TreeDataProvider<ProviderItem> {
	constructor(public sessionItem: SessionTreeItem | null) { }

	getTreeItem(element: ProviderItem): ProviderItem {
		return element;
	}

	getChildren(element?: ProviderItem): Thenable<ProviderItem[]> {
		const item = this.sessionItem;

		// Root -> returns sessions names
		if (!element && item) {
			return item.problems();
		} else if (element instanceof ProblemTreeItem) {
			return element.getTestArray();
		}

		return Promise.resolve([]);
	}

	private _onDidChangeTreeData: vscode.EventEmitter<ProviderItem | undefined> = new vscode.EventEmitter<ProviderItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<ProviderItem | undefined> = this._onDidChangeTreeData.event;

	changeSession(item: SessionTreeItem): void {
		this.sessionItem = item;
		this.resfresh();
	}

	resfresh() {
		this._onDidChangeTreeData.fire(undefined);
	}
}
