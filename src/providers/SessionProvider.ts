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

  constructor(private workspaceRoot: string, private context: vscode.ExtensionContext) {
    this.areLibrariesCopied = fs.existsSync(path.join(workspaceRoot, LIBRARIES_DIRECTORY));
  }

  getTreeItem(element: SessionTreeItem): SessionTreeItem {
    return element;
  }

  getChildren(element?: SessionTreeItem): Thenable<SessionTreeItem[]> {
    const workspacePath = path.join(this.workspaceRoot, WORKSPACE_DIRECTORY);
    
    // Root -> returns sessions names
    if (!element && fs.existsSync(workspacePath)) {
      return fs.promises.readdir(workspacePath)
        .then(async (files) => {
          // Copy libraries if they were not and some sessions exists
          if (files.length > 0 && !this.areLibrariesCopied) {
            await this.copyLibraries();
          }

          return files.map(file => new SessionTreeItem(
            file,
            workspacePath,
            this.context
          ))
        });
    }

    return Promise.resolve([]);
  }


  private _onDidChangeTreeData: vscode.EventEmitter<SessionTreeItem | undefined> = new vscode.EventEmitter<SessionTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<SessionTreeItem | undefined> = this._onDidChangeTreeData.event;

  copyLibraries() {
    return new Promise((res, rej) => {
      fsextra.copy(this.context.extensionPath + "/resources/lib", path.join(this.workspaceRoot, "lib"), (err) => {
        if (err) rej(err);
        else {
          this.areLibrariesCopied = true;
          res();
        }
      });
    });
  }

  async createNew(name: string) {
    const cancellation = new vscode.CancellationTokenSource();
    const sessionPath = path.join(this.workspaceRoot, WORKSPACE_DIRECTORY, name);
    let libraryCopy: Promise<any> | undefined;

    if (fs.existsSync(sessionPath)) {
      vscode.window.showErrorMessage(`Folder '${name}' already exists, please choose another name.`);
      return;
    }

    if (!this.areLibrariesCopied) {
      libraryCopy = this.copyLibraries();
    }

    // Create directory
    await fs.promises.mkdir(sessionPath, { recursive: true });

    const setups = this.context.globalState.get<{ [name: string]: SessionSettings }>("availableSetups", defaultAvailableSetups);

    // Ask for settings
    const result = await vscode.window.showQuickPick(Object.keys(setups).map(label => ({ label })), {
      placeHolder: "Setup to use for the session"
    }, cancellation.token);

    // Check for cancellation
    if (cancellation.token.isCancellationRequested || !result) {
      return;
    }

    // Save and write settings
    const settings = setups[result.label];
    await saveSettings(sessionPath, settings);

    // Trigger view update
    this._onDidChangeTreeData.fire(undefined);

    if (libraryCopy) {
      await libraryCopy;
    }
  }
}
