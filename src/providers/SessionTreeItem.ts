import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProblemTreeItem } from "./ProblemProvider";
import { PROBLEM_PREFIX } from './SessionProvider';
import { loadSettings, saveSettings, SessionSettings } from './Settings';


export class SessionTreeItem extends vscode.TreeItem {
  public readonly problems: ProblemTreeItem[] = [];
  private _settings: SessionSettings | null = null;

  constructor(
    public readonly label: string,
    private workspacePath: string,
    private context: vscode.ExtensionContext
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    const subFolders = fs.readdirSync(path.join(this.path));

    this.problems = subFolders.filter(file => file.startsWith(PROBLEM_PREFIX)).map(file => {
      return new ProblemTreeItem(file, this.path);
    });
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'session-black.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'session-white.svg')
  };

  public get path() {
    return path.join(this.workspacePath, this.label);
  }

  public async newProblem() {
    let index = this.problems.length;

    while (this.problems.some(it => it.folderName === PROBLEM_PREFIX + index)) {
      index += 1;
    }

    const problemFolder = PROBLEM_PREFIX + index;
    const sessionPath = this.path;

    // Create all problem folders
    await fs.promises.mkdir(path.join(sessionPath, problemFolder, "inputs"), { recursive: true });
    await fs.promises.mkdir(path.join(sessionPath, problemFolder, "outputs"), { recursive: true });

    // Copy template
    await fs.promises.copyFile(this.context.extensionPath + "/resources/template.txt", path.join(sessionPath, problemFolder, "index.ts"));

    if (this.settings.importSets) {
      // TODO await fetchExamples(this);
    }

    this.problems.push(new ProblemTreeItem(problemFolder, sessionPath));
  }

  public get settings(): SessionSettings {
    if (this._settings === null) {
      this._settings = loadSettings(this.path);
    }

    return this._settings;
  }

  public set settings(settings: SessionSettings) {
    saveSettings(this.path, settings);
    this._settings = settings;
  }
}
