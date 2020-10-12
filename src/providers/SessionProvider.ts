import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as fsextra from "fs-extra";

import { SessionTreeItem } from './SessionTreeItem';
import { saveSettings, SessionSettings } from "./Settings"
import chalk = require('chalk');

export const PROBLEM_PREFIX = "problem";
export const LIBRARIES_DIRECTORY = "lib";
export const WORKSPACE_DIRECTORY = "workspace";

const defaultAvailableSetups = {
  "battledev": {
    importSets: true,
    inputFilePattern: "^.+?input([0-9]+)\\.txt$",
    outputFilePattern: "^.+?output([0-9]+)\\.txt$"
  },
  "coding-battle": {
    importSets: false
  }
};

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
            await this.copyLibraries();
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

  copyLibraries() {
    return vscode.workspace.fs.copy(
      vscode.Uri.joinPath(this.context.extensionUri, "resources/lib"),
      vscode.Uri.joinPath(this.rootDir, "lib")
    ).then(() => this.areLibrariesCopied = true);
  }

  async createNew(name: string) {
    const sessionPath = vscode.Uri.joinPath(this.rootDir, WORKSPACE_DIRECTORY, name);
    let libraryCopy: Thenable<any> | undefined;

    const stat = await vscode.workspace.fs.stat(sessionPath).then(it => it, () => null);
    if (stat) {
      vscode.window.showErrorMessage(`Folder '${name}' already exists, please choose another name.`);
      return;
    }

    if (!this.areLibrariesCopied) {
      libraryCopy = this.copyLibraries();
    }

    // Create directory
    await vscode.workspace.fs.createDirectory(sessionPath);

    const setups = this.context.globalState.get<{ [name: string]: SessionSettings }>("availableSetups", defaultAvailableSetups);

    // Ask for settings
    const result = await vscode.window.showQuickPick(Object.keys(setups).map(label => ({ label })), {
      placeHolder: "Setup to use for the session"
    });

    // Check for cancellation
    if (!result) {
      return;
    }

    // Save and write settings
    const settings = setups[result.label];
    await saveSettings(sessionPath, settings);

    if (libraryCopy) {
      await libraryCopy;
    }
  }

  refresh() {
    // Trigger view update
    this._onDidChangeTreeData.fire(undefined);
  }
}
