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
import * as utilities from '../utilities';

export class CreateProjectCommandProvider {
    public static readonly commandName = 'overtest-task-generator.create-project';

    public static register(): vscode.Disposable {
        return vscode.commands.registerCommand(CreateProjectCommandProvider.commandName, CreateProjectCommandProvider.runCommand);
    }

    private static runCommand() { new CreateProjectCommandProvider().execute(); }

    private async execute() {
        /* Project folder picker --- */
        let workspaceFolder = await vscode.window.showWorkspaceFolderPick({ placeHolder: "Оберіть папку, у якій слід ініціалізувати проєкт" });
        if (workspaceFolder === undefined) { return; }
        if (vscode.workspace.fs.isWritableFileSystem(workspaceFolder.uri.scheme) !== true) {
            vscode.window.showErrorMessage("Виникла помилка: вказана вами папка знаходиться у файловій системі, доступній лише для читання!", "OK");
            return;
        }
        if ((await vscode.workspace.findFiles(new vscode.RelativePattern(workspaceFolder, "**/*"), undefined, 1)).length > 0) {
            vscode.window.showErrorMessage("Щоб ініціалізувати проєкт, оберіть пусту папку.", "OK");
            return;
        }
        /* --- Project folder picker */

        /* Project template picker --- */
        let availableProjectTemplates: string[] = [ "Пустий проєкт" ];
        let projectTemplate = await vscode.window.showQuickPick(availableProjectTemplates, {
            title: "Оберіть бажаний шаблон проєкту",
            ignoreFocusOut: true,
            canPickMany: false
        });
        if (projectTemplate === undefined) { return; }
        /* --- Project template picker */

        let projectTemplateIndex = availableProjectTemplates.indexOf(projectTemplate);

        // TODO: Allow using remote project templates
        if (projectTemplateIndex !== 0) { return; }

        this.createEmptyProject(workspaceFolder);

        await vscode.window.showInformationMessage(`Проєкт Overtest Task Generator під назвою \"${workspaceFolder.name}\" створено успішно!`, "OK");
    }

    private createEmptyProject(workspaceFolder: vscode.WorkspaceFolder)
    {
        // Create main project file
        const projectFileName = ".ovtask";
        let projectFileUri = vscode.Uri.joinPath(workspaceFolder.uri, projectFileName);
        // TODO: Fix file creation mechanism
        vscode.workspace.fs.writeFile(projectFileUri, Buffer.from(""));

        // Open main project file in the custom editor
        utilities.openCustomFile(projectFileUri, projectFileName);
    }
}