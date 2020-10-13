import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { SessionTreeItem } from './SessionTreeItem';
import Settings, { SessionSettings } from "./Settings"
import { setupWorkspace } from '../Workspace';
import { EXPORT_INPUT_FILE, LOCAL_INPUT_FILE } from '../Bundler';

export const PROBLEM_PREFIX = "problem";
export const LIBRARIES_DIRECTORY = "lib";
export const WORKSPACE_DIRECTORY = "workspace";

export class SessionProvider implements vscode.TreeDataProvider<SessionTreeItem> {
  private areLibrariesCopied = false;

  constructor(private rootDir: vscode.Uri, private context: vscode.ExtensionContext) {
    this.areLibrariesCopied = fs.existsSync(path.join(rootDir.fsPath, LIBRARIES_DIRECTORY));
  }

  getTreeItem(element: SessionTreeItem): SessionTreeItem {
    return element;
  }

  getChildren(element?: SessionTreeItem): Thenable<SessionTreeItem[]> {
    const workspacePath = vscode.Uri.joinPath(this.rootDir, WORKSPACE_DIRECTORY);

    // Root -> returns sessions names
    if (!element) {
      return vscode.workspace.fs.readDirectory(workspacePath)
        .then(async (files) => {
          // Copy libraries if they were not and some sessions exists
          if (files.length > 0 && !this.areLibrariesCopied) {
            await setupWorkspace(this.rootDir, this.context);
          }

          return files.map(file => new SessionTreeItem(
            file[0],
            this.rootDir,
            this.context
          ))
        }, () => []);
    }

    return Promise.resolve([]);
  }


  private _onDidChangeTreeData: vscode.EventEmitter<SessionTreeItem | undefined> = new vscode.EventEmitter<SessionTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<SessionTreeItem | undefined> = this._onDidChangeTreeData.event;

  async createNew(name: string) {
    const sessionPath = vscode.Uri.joinPath(this.rootDir, WORKSPACE_DIRECTORY, name);
    let libraryCopy: Thenable<any> | undefined;

    const stat = await vscode.workspace.fs.stat(sessionPath).then(it => it, () => null);
    if (stat) {
      vscode.window.showErrorMessage(`Folder '${name}' already exists, please choose another name.`);
      return;
    }

    if (!this.areLibrariesCopied) {
      libraryCopy = setupWorkspace(this.rootDir, this.context);
    }


    const setups = await Settings.configurations(this.context);

    // Ask for settings
    const result = await vscode.window.showQuickPick(Object.keys(setups).map(label => ({ label })), {
      placeHolder: "Setup to use for the session"
    });

    // Check for cancellation
    if (!result) {
      return;
    }

    // Create directory
    await vscode.workspace.fs.createDirectory(sessionPath);

    // Save and write settings
    const settings = setups[result.label];
    await Settings.save(sessionPath, settings);
    
    // Copy input file
    const exportInputFile = vscode.Uri.joinPath(sessionPath, EXPORT_INPUT_FILE + ".ts");
    const defaultInputFile = vscode.Uri.joinPath(this.context.extensionUri, "resources", "configurations", "default_input.ts");

    await vscode.workspace.fs.copy(defaultInputFile, vscode.Uri.joinPath(sessionPath, LOCAL_INPUT_FILE + ".ts"));

    // Custom input for export
    if (settings.customInput) {
      await vscode.workspace.fs.copy(
        vscode.Uri.joinPath(this.context.extensionUri, "resources", "configurations", result.label, "input.ts"),
        exportInputFile
      );
    }

    vscode.window.showInformationMessage("Session settings saved !");

    if (libraryCopy) {
      await libraryCopy;
    }
  }

  refresh() {
    // Trigger view update
    this._onDidChangeTreeData.fire(undefined);
  }
}
