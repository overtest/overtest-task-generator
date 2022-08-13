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

import * as editor_components from './components/editor_components.js';

/* Local variables --- */
let taskCreationState = undefined;
/* --- Local variables */

// Acquire VS Code API to communicate with the provider
const vscode = acquireVsCodeApi();

/* Actions and components --- */
const editFileAction = (fileName) => vscode.postMessage({ command: 'edit_file', fileName: fileName });
const exportTaskAction = () => vscode.postMessage({ command: 'export_task' });
const verifyTaskAction = () => vscode.postMessage({ command: 'verify_task' });

const taskCreationStepComponent = {
    view: (vnode) => m("div", m("vscode-checkbox", { style: "margin: 10px; margin-left: 0;", checked: vnode.attrs.isCompleted, readonly: true }, [
        m("h3", vnode.attrs.title), m("p", vnode.attrs.description),
        m("vscode-button", { appearance: vnode.attrs.isCompleted ? "secondary" : "", style: "margin-top: 5px;", onclick: vnode.attrs.buttonAction }, [
            m("", vnode.attrs.buttonTitle),
            m("span", { slot: "start", class: "codicon codicon-arrow-right" })
        ])
    ]))
};
/* --- Actions and components */

/* Handle requests from VS Code extension --- */
window.addEventListener('message', event => {
    // Get the details of the message event
    const message = event.data;
    // Handle only specified messages from the provider
    switch (message.command) {
        // Handle form data update
        case 'update_steps':
            taskCreationState = message;
            m.redraw();
            break;
    }
});
/* --- Handle requests from VS Code extension */

/* Build dynamic webview UI --- */
m.mount(document.body, {
    view: () => m("main", [
        // Webview header component
        m(editor_components.headerComponent, {
            title: "Overtest Task Generator",
            description: "Огляд проєкту зі створення завдання до системи Overtest"
        }),

        m("p", { style: "font-size: 120%;" }, "Перш ніж згенерувати завдання для системи Overtest, необхідно виконати кілька простих кроків:"),

        /* Programming task creation steps --- */
        m("div", { style: "margin: 10px;" }, [
            m(taskCreationStepComponent, {
                title: "Заповнення інформації про завдання",
                description: "Вказати основні дані про створюване завдання.",
                isCompleted: taskCreationState?.projectFile,
                buttonTitle: "Перейти до заповнення",
                buttonAction: () => editFileAction("project.ovtask.json")
            }),

            m(taskCreationStepComponent, {
                title: "Написання умов до виконання завдання",
                description: "Розповісти суть проблеми і вимоги до її розв'язання.",
                isCompleted: taskCreationState?.descriptionFile,
                buttonTitle: "Перейти до редагування",
                buttonAction: () => editFileAction("description.ovtask.md")
            }),

            m(taskCreationStepComponent, {
                title: "Управління процесом тестування розв'язків",
                description: "Налагодити процес тестування і оцінювання розв'язків.",
                isCompleted: taskCreationState?.verificationFile,
                buttonTitle: "Перейти до формування",
                buttonAction: () => editFileAction("verification.ovtask.json")
            })
        ]),
        /* --- Programming task creation steps */

        m("p", { style: "font-size: 120%; margin-bottom: 10px;" }, "Після виконання усіх вище зазначених кроків, ви можете згенерувати архів із завданням, який можна завантажити в Overtest:"),
        
        m("vscode-button", { appearance: taskCreationState?.completed ? "" : "secondary", disabled: !taskCreationState?.completed, style: "margin-right: 10px;", onclick: exportTaskAction }, [
            m("", "Експортувати завдання"),
            m("span", { slot: "start", class: "codicon codicon-archive" })
        ]),

        m("vscode-button", { appearance: "secondary", disabled: !taskCreationState?.completed, onclick: verifyTaskAction }, [
            m("", "Виконати перевірку"),
            m("span", { slot: "start", class: "codicon codicon-github-action" })
        ])
    ])
});
/* --- Build dynamic webview UI */