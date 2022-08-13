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

import * as vscode from 'vscode';
import { getNonce } from '../utilities';

export class VerificationEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new VerificationEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(VerificationEditorProvider.viewType, provider, {
            webviewOptions: {
                enableFindWidget: false,
                retainContextWhenHidden: true
            }
        });
        return providerRegistration;
    }

    public static readonly viewType = 'overtest-task-generator.verification-editor';

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

        const updateWebview = () => {
            let documentText: string = document.getText();
            webviewPanel.webview.postMessage({
                command: 'update',
                model: documentText.length > 0
                    ? JSON.parse(documentText)
                    : { /* Pass an empty object */ },
            });
        };

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });
        webviewPanel.webview.onDidReceiveMessage(async e => {
            switch (e.command) {
                case 'update':
                    // TODO: Perform validity checks
                    await this.updateTextDocument(document, JSON.stringify(e.model, null, 4));
                    return;
            }
        });
        webviewPanel.onDidDispose(() => changeDocumentSubscription.dispose());

        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        // Generate a new nonce f0or the web page
        const nonce = getNonce();

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
            this.context.extensionUri, 'media', 'webviews', 'verificationEditor.js'));

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
        let modifiedContent = newContent;
        // Don't apply an edit in case no changes
        if (document.getText() === modifiedContent) { vscode.window.showErrorMessage("LOL 2"); return; }
        // Make an edit of a document
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), modifiedContent);
        return vscode.workspace.applyEdit(edit);
    }
}