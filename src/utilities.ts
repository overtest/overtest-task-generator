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
import { OverviewPageProvider } from './webviews/overviewPage';
import { ProjectEditorProvider } from './webviews/projectEditor';

export function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export async function fileExists(fileUri: vscode.Uri): Promise<boolean> {
    try { await vscode.workspace.fs.stat(fileUri); } catch { return false; }
    return true;
}

export function openCustomFile(fileUri: vscode.Uri, fileName: string) {
    let viewType : string = "";
    switch (fileName)
    {
        case ".ovtask": viewType = OverviewPageProvider.viewType; break;
        case "project.ovtask.json": viewType = ProjectEditorProvider.viewType; break;
        //case "verification.ovtask.json": /* TODO */ break;
        default:
            vscode.window.showTextDocument(fileUri, { preview: false });
            return;
    }
    vscode.commands.executeCommand("vscode.openWith", fileUri, viewType);
}