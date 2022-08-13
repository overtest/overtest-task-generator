/*
 * Overtest Task Generator
 * Copyright (C) 2022, Yurii Kadirov (aka Sirkadirov).
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { TextEncoder } from 'util';
import * as vscode from 'vscode';
import * as utilities from '../utilities';

export class OverviewPageProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new OverviewPageProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(OverviewPageProvider.viewType, provider, {
            webviewOptions: {
                enableFindWidget: false,
                retainContextWhenHidden: true
            }
        });
        return providerRegistration;
    }

    public static readonly viewType = 'overtest-task-generator.overview-page';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        /* Update webview function --- */
        const updateWebview = async () => {
            // Get the workspace folder and its Uri
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            if (workspaceFolder === undefined) { return; }
            const workspaceFolderUri = workspaceFolder.uri;

            // Form a message to the webview
            let message = {
                command: 'update_steps',
                projectFile: await (async () => {
                    const fileUri = vscode.Uri.joinPath(workspaceFolderUri, "project.ovtask.json");
                    if (!await utilities.fileExists(fileUri)) { return false; }

                    // TODO: Verify JSON schema
                    return true;
                })(),
                descriptionFile: await (async () => {
                    const fileUri = vscode.Uri.joinPath(workspaceFolderUri, "description.ovtask.md");
                    if (!await utilities.fileExists(fileUri)) { return false; }

                    let textDocument = await vscode.workspace.openTextDocument(fileUri);
                    if (textDocument.getText().trim().length < 100) { return false; } // TODO: Improve this in the future releases!

                    return true;
                })(),
                verificationFile: await (async () => {
                    const fileUri = vscode.Uri.joinPath(workspaceFolderUri, "verification.ovtask.json");
                    if (!await utilities.fileExists(fileUri)) { return false; }

                    // TODO: Verify JSON schema
                    return true;
                })(),
                completed: false
            };
            // Compute task creation completion status
            message.completed = message.projectFile && message.descriptionFile && message.verificationFile;

            // Post the message into the webview
            webviewPanel.webview.postMessage(message);
        };
        /* --- Update webview function */

        /* Inbound webview messages handler --- */
        webviewPanel.webview.onDidReceiveMessage(async e => {
            switch (e.command) {
                case 'edit_file':
                    const fileName: string = e.fileName;
                    
                    // Form a full path (Uri) to the file
                    let folderUri = vscode.workspace.getWorkspaceFolder(document.uri)?.uri;
                    if (folderUri === undefined) { return; }
                    let fileUri = vscode.Uri.joinPath(folderUri, fileName);

                    // Create a file if it's not exists
                    try { await vscode.workspace.fs.stat(fileUri); }
                    catch { await vscode.workspace.fs.writeFile(fileUri, Uint8Array.from(new TextEncoder().encode(""))); }

                    // Update webview before opening the file
                    updateWebview();

                    // Open file in VS Code
                    utilities.openCustomFile(fileUri, fileName);
                    break;
                case 'export_task':
                    // Get the workspace folder and its Uri
                    /*const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
                    if (workspaceFolder === undefined) { return; }
                    const workspaceFolderUri = workspaceFolder.uri;

                    const archiveFileName = `${workspaceFolder?.name.toLowerCase()}.zip`;
                    const backupFileName = `${workspaceFolder?.name.toLowerCase()}.backup.zip`;

                    let archiveFileUri = vscode.Uri.joinPath(workspaceFolderUri, archiveFileName);
                    let backupFileUri = vscode.Uri.joinPath(workspaceFolderUri, backupFileName);
                    let backupFileCreated: boolean = false;

                    if (await utilities.fileExists(archiveFileUri))
                    {
                        vscode.workspace.fs.rename(archiveFileUri, backupFileUri, { overwrite: true });
                        backupFileCreated = true;
                    }

                    // TODO: Create a zip archive containing programming task data

                    await vscode.window.showInformationMessage(`Експорт завдання виконано успішно! Тепер ви можете імпортувати файл \"${archiveFileName}\" у систему Overtest.`, "OK");*/
                    vscode.window.showWarningMessage("Цей функціонал буде реалізовано у наступних версіях розширення Overtest Task Generator для VS Code.", "OK");
                    
                    break;
                case 'verify_task':
                    vscode.window.showWarningMessage("Цей функціонал буде реалізовано у наступних версіях розширення Overtest Task Generator для VS Code.", "OK");
                    break;
            }
        });
        /* --- Inbound webview messages handler */

        await updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        // Generate a new nonce f0or the web page
        const nonce = utilities.getNonce();

        // Paths to UI toolkit, icons library, frontend framework, etc.
        const vscodeUiIconsUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, "node_modules", "@vscode", "codicons", "dist", "codicon.css"));
        const vscodeUiToolkitUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, "node_modules", "@vscode", "webview-ui-toolkit", "dist", "toolkit.js"));
        const mithrilUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, "node_modules", "mithril", "mithril.min.js"));

        // Paths to custom styling and UI builder script
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'webviews', 'styles.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'webviews', 'overviewPage.js'));

        return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';"-->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Overtest Task Generator</title>
                <link nonce="${nonce}" rel="stylesheet" href="${stylesUri}" />
                <link nonce="${nonce}" rel="stylesheet" href="${vscodeUiIconsUri}" />
                <script nonce="${nonce}" src="${vscodeUiToolkitUri}" type="module"></script>
			</head>
			<body>
				<script nonce="${nonce}" src="${mithrilUri}"></script>
                <script nonce="${nonce}" src="${scriptUri}" type="module"></script>
			</body>
			</html>`;
    }

    private updateTextDocument(document: vscode.TextDocument, newContent: string) {
        // Trim the new content of the document
        newContent = newContent.trim();
        // Don't apply an edit in case no changes
        if (document.getText().trim() === newContent) { return; }
        // Make an edit of a document
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), newContent);
        return vscode.workspace.applyEdit(edit);
    }
}