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

// Acquire VS Code API to communicate with the provider
const vscode = acquireVsCodeApi();

/* Handle requests from VS Code extension --- */
window.addEventListener('message', event => {
    // Get the details of the message event
    const message = event.data;
    // Handle only specified messages from the provider
    switch (message.command) {
        // Handle form data update
        case 'update':
            if (Object.keys(message.model).length <= 0) { break; }
            model = message.model;
            m.redraw();
            break;
    }
});
/* --- Handle requests from VS Code extension */

/* Handle submission of the form --- */
const submitHandler = () => {
    model.identifier?.length <= 0 && (model.identifier = null);
    model.title?.length <= 0 && (model.title = null);
    model.category?.length <= 0 && (model.category = null);

    model.difficulty < 0 && (model.difficulty = 1);
    model.difficulty > 100 && (model.difficulty = 100);

    vscode.postMessage({
        command: 'update',
        model: model
    });
};
/* --- Handle submission of the form */

/* Editor model --- */
let model = {
    "identifier": null,
    "title": null,
    "category": null,
    "difficulty": 1
};
/* --- Editor model */

/* Build dynamic webview UI --- */
m.mount(document.body, {
    view: () => m("main", [
        // Webview header component
        m(editor_components.headerComponent, {
            title: "Редагування інформації про завдання",
            description: "Цей файл містить основну інформацію про завдання, яка буде відображатися в системі."
        }),
        m("div", [
            // identifier
            m("vscode-text-field", {
                minlength: 36, maxlength: 36,
                value: model.identifier,
                onkeyup: (e) => model.identifier = e.target.value.trim()
            }, "Ідентифікатор завдання:"),
            // title
            m("vscode-text-field", {
                minlength: 3, maxlength: 100,
                value: model.title,
                onkeyup: (e) => model.title = e.target.value.trim()
            }, "Назва завдання:"),
            // category
            m("vscode-text-field", {
                minlength: 0, maxlength: 100,
                value: model.category,
                onkeyup: (e) => model.category = e.target.value.trim()
            }, "Категорія завдання:"),
            // difficulty
            m("vscode-text-field", {
                type: "number", min: 0, max: 100,
                value: model.difficulty,
                onkeyup: (e) => model.difficulty = parseInt(e.target.value.trim())
            }, "Рейтинговий бал:"),
        ]),
        // Form actions component
        m(editor_components.formActionsComponent, { onsubmit: submitHandler })
    ])
});
/* --- Build dynamic webview UI */