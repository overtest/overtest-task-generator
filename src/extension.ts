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

import { CreateProjectCommandProvider } from './commands/createProject';
import { OverviewPageProvider } from './webviews/overviewPage';
import { ProjectEditorProvider } from './webviews/projectEditor';
import { VerificationEditorProvider } from './webviews/verificationEditor';

export function activate(context: vscode.ExtensionContext) {
	console.log('Overtest Task Generator extension activated!');

	// Add custom extension commands
	context.subscriptions.push(CreateProjectCommandProvider.register());

	// Add custom editors and webviews
	context.subscriptions.push(OverviewPageProvider.register(context));
	context.subscriptions.push(ProjectEditorProvider.register(context));
	context.subscriptions.push(VerificationEditorProvider.register(context));
}

export function deactivate() {
	console.log('Overtest Task Generator extension deactivated!');
}