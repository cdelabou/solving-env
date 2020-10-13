import * as vscode from 'vscode';
import * as path from 'path';
import { ProblemTreeItem } from "./ProblemProvider";
import { PROBLEM_PREFIX, WORKSPACE_DIRECTORY } from './SessionProvider';
import Settings, { SessionSettings } from './Settings';

const fs = vscode.workspace.fs;
const Uri = vscode.Uri;

export class SessionTreeItem extends vscode.TreeItem {
  private _problems: ProblemTreeItem[] | null = null;
  private _settings: SessionSettings | null = null;

  constructor(
    public readonly label: string,
    public readonly rootFolder: vscode.Uri,
    public readonly context: vscode.ExtensionContext
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    
  }

  async problems() {
    if (!this._problems) {
      const subFolders = await fs.readDirectory(this.path);

      this._problems = subFolders.filter(file => file[0].startsWith(PROBLEM_PREFIX)).map(file => {
        return new ProblemTreeItem(file[0], this.path);
      });
    }

    return this._problems;
  }

  async addProblem(problem: ProblemTreeItem) {
    const problems = await this.problems();

    problems.push(problem);
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'session-black.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'session-white.svg')
  };

  public get path() {
    return vscode.Uri.joinPath(this.rootFolder, WORKSPACE_DIRECTORY, this.label);
  }

  public async newProblem() {
    const problems = await this.problems();
    let index = problems.length;

    while (problems.some(it => it.folderName === PROBLEM_PREFIX + index)) {
      index += 1;
    }

    const problemFolder = PROBLEM_PREFIX + index;
    const sessionPath = this.path;

    // Create all problem folders
    await fs.createDirectory(vscode.Uri.joinPath(sessionPath, problemFolder, "inputs"));
    await fs.createDirectory(vscode.Uri.joinPath(sessionPath, problemFolder, "outputs"));

    // Copy template
    await fs.copy(
      Uri.joinPath(this.context.extensionUri, "resources/template.txt"),
      Uri.joinPath(sessionPath, problemFolder, "index.ts")
    );

    const settings = await this.settings();
    if (settings.importSets) {
      // TODO await fetchExamples(this);
    }

    await this.addProblem(new ProblemTreeItem(problemFolder, sessionPath));
  }

  /**
   * Async getter / setter for settings
   * @param newValue new settings value
   */
  public async settings(newValue?: SessionSettings) {
    if (newValue) {
      Settings.save(this.path, newValue);
      this._settings = newValue;
    } else if (this._settings === null) {
        this._settings = await Settings.load(this.path);
    }

    return this._settings;
  }
}
