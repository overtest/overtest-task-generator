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

/* eslint-disable @typescript-eslint/naming-convention */
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
const submitForm = () => {
    model.author_solution.compiler_id?.length <= 0 && (model.author_solution.compiler_id = null);
    model.author_solution.source_path?.length <= 0 && (model.author_solution.source_path = null);

    model.testlib.initializer?.length <= 0 && (model.testlib.initializer = null);
    model.testlib.finalizer?.length <= 0 && (model.testlib.finalizer = null);
    model.testlib.generator?.length <= 0 && (model.testlib.generator = null);
    model.testlib.checker?.length <= 0 && (model.testlib.checker = null);

    model.io_redirection.input_file_name?.length <= 0 && (model.io_redirection.input_file_name = null);
    model.io_redirection.output_file_name?.length <= 0 && (model.io_redirection.output_file_name = null);

    vscode.postMessage({
        command: 'update',
        model: model
    });
};
/* --- Handle submission of the form */

/* Editor model --- */
let model = {
    "author_solution": {
        "compiler_id": null,
        "source_path": null
    },
    "testlib": {
        "initializer": null,
        "finalizer": null,
        "generator": null,
        "checker": null
    },
    "io_redirection": {
        "input_file_name": "input.dat",
        "output_file_name": "output.dat"
    },
    "runtime_limits": {
        "max_exec_time": 1000,
        "max_proc_time": 1000,
        "max_wset_size": 102400
    },
    "on_release": {
        "max_time_kills": 1,
        "tests": []
    }
};
/* --- Editor model */

const appendReleaseTest = () => model.on_release.tests.push({
    "title": "",
    "use_author_solution": false,
    "runtime_limits": null
});
const toggleReleaseTestRuntimeLimits = (index) => {
    if (model.on_release.tests[index].runtime_limits === null)
    { model.on_release.tests[index].runtime_limits = structuredClone(model.runtime_limits); }
    else { model.on_release.tests[index].runtime_limits = null; }
};
const removeReleaseTest = (index) => model.on_release.tests.splice(index, 1);

let runtimeLimitsEditorComponent = {
    view: (vnode) => m("section", { style: "padding: 0;" }, [
        // max_exec_time
        m("vscode-text-field", {
            type: "number", value: vnode.attrs.model.max_exec_time,
            onchange: (e) => {
                vnode.attrs.model.max_exec_time = parseInt(e.target.value);
                vnode.attrs.onchanged(vnode.attrs.model);
            }
        }, "Максимальний астрономічний час виконання, мілісекунд (max_exec_time):"),

        // max_proc_time
        m("vscode-text-field", {
            type: "number", value: vnode.attrs.model.max_proc_time,
            onchange: (e) => {
                vnode.attrs.model.max_proc_time = parseInt(e.target.value);
                vnode.attrs.onchanged(vnode.attrs.model);
            }
        }, "Максимальний процесорний час виконання, мілісекунд (max_proc_time):"),

        // max_wset_size
        m("vscode-text-field", {
            type: "number", value: vnode.attrs.model.max_wset_size,
            onchange: (e) => {
                vnode.attrs.model.max_wset_size = parseInt(e.target.value);
                vnode.attrs.onchanged(vnode.attrs.model);
            }
        }, "Максимальний розмір робочого простору, кібібайт (max_wset_size):"),
    ])
};

/* Build dynamic webview UI --- */
m.mount(document.body, {
    view: () => m("main", [
        // Webview header component
        m(editor_components.headerComponent, {
            title: "Редагування налаштувань тестування",
            description: "Цей файл містить конфігурацію процесу тестування розв'язків користувачів."
        }),
        // Editor panels
        m("vscode-panels", [
            /* Author solution tab --- */
            m("vscode-panel-tab", "AUTHOR SOLUTION"),
            m("vscode-panel-view", m("section", [
                // compiler_id
                m("vscode-text-field", {
                    minlength: 36, maxlength: 36,
                    value: model.author_solution.compiler_id,
                    onkeyup: (e) => model.author_solution.compiler_id = e.target.value.trim()
                }, "Ідентифікатор компілятора (compiler_id):"),

                // source_path
                m("vscode-text-field", {
                    maxlength: 255, value: model.author_solution.source_path,
                    onkeyup: (e) => model.author_solution.source_path = e.target.value.trim()
                }, "Шлях до директорії із розв'язком (source_path):"),
            ])),
            /* --- Author solution tab */

            /* TestLib tab --- */
            m("vscode-panel-tab", "TESTLIB"),
            m("vscode-panel-view", m("section", [
                // initializer
                m("vscode-text-field", {
                    maxlength: 255, value: model.testlib.initializer,
                    onkeyup: (e) => model.testlib.initializer = e.target.value.trim()
                }, "Шлях до файлу \"initializer\":"),

                // finalizer
                m("vscode-text-field", {
                    maxlength: 255, value: model.testlib.finalizer,
                    onkeyup: (e) => model.testlib.finalizer = e.target.value.trim()
                }, "Шлях до файлу \"finalizer\":"),

                // generator
                m("vscode-text-field", {
                    maxlength: 255, value: model.testlib.generator,
                    onkeyup: (e) => model.testlib.generator = e.target.value.trim()
                }, "Шлях до файлу \"generator\":"),

                // checker
                m("vscode-text-field", {
                    maxlength: 255, value: model.testlib.checker,
                    onkeyup: (e) => model.testlib.checker = e.target.value.trim()
                }, "Шлях до файлу \"checker\":"),
            ])),
            /* --- TestLib tab */

            /* I/O redirection tab --- */
            m("vscode-panel-tab", "IO REDIRECTION"),
            m("vscode-panel-view", m("section", [
                // input_file_name
                m("vscode-text-field", {
                    maxlength: 100, value: model.io_redirection.input_file_name,
                    onkeyup: (e) => model.io_redirection.input_file_name = e.target.value.trim()
                }, "Назва файлу зі вхідними даними (input_file_name):"),

                // output_file_name
                m("vscode-text-field", {
                    maxlength: 100, value: model.io_redirection.output_file_name,
                    onkeyup: (e) => model.io_redirection.output_file_name = e.target.value.trim()
                }, "Назва файлу з вихідними даними (output_file_name):"),
            ])),
            /* --- I/O redirection tab */

            /* Runtime limits tab --- */
            m("vscode-panel-tab", "RUNTIME LIMITS"),
            m("vscode-panel-view", m("section", [
                m(runtimeLimitsEditorComponent, {
                    model: model.runtime_limits,
                    onchanged: ((modified_model) => model.runtime_limits = modified_model)
                }),
            ])),
            /* --- Runtime limits tab */

            /* On release configuration tab --- */
            m("vscode-panel-tab", "ON RELEASE"),
            m("vscode-panel-view", m("section", [
                // max_time_kills
                m("vscode-text-field", {
                    type: "number", value: model.on_release.max_time_kills,
                    onkeyup: (e) => model.on_release.max_time_kills = e.target.value
                }, "Максимальна кількість перевищень по часу (max_time_kills):"),

                m("div", { name: "tests" }, [
                    m("h3", "Перелік тестів (tests):"),

                    // Tests not found message box
                    (model.on_release.tests.length <= 0) && m("p", { style: "margin-bottom: 10px;" },
                        "Тестів не знайдено! Додайте новий, натиснувши кнопку нижче."),

                    model.on_release.tests.map((current_test, current_index) => m("fieldset", { name: current_index }, [
                        m("legend", `Тест №${current_index + 1}`),

                        m("vscode-text-field", {
                            maxlength: 100, value: current_test.title,
                            onkeyup: (e) => model.on_release.tests[current_index].title = e.target.value.trim()
                        }, "Назва тесту (title):"),

                        m("vscode-checkbox", {
                            value: current_test.use_author_solution,
                            onclick: (e) => model.on_release.tests[current_index].use_author_solution = (e.target.value === "on" || e.target.value === "true")
                        }, "Використовувати авторський розв'язок на тесті"),

                        model.on_release.tests[current_index].runtime_limits !== null && m("fieldset", { name: "runtime_limits" }, [
                            m("legend", "Обмеження часу виконання (runtime_limits)"),

                            m(runtimeLimitsEditorComponent, {
                                model: model.on_release.tests[current_index].runtime_limits,
                                onchanged: ((modified_model) => model.on_release.tests[current_index].runtime_limits = modified_model)
                            }),
                        ]),

                        model.on_release.tests[current_index].runtime_limits === null && m("br"),

                        m("vscode-button", {
                            type: "button", onclick: () => toggleReleaseTestRuntimeLimits(current_index),
                            appearance: "secondary", style: "margin-bottom: 10px; margin-right: 10px;"
                        }, [
                            m("", model.on_release.tests[current_index].runtime_limits === null
                                ? "Встановити обмеження"
                                : "Видалити обмеження"),
                            m("span", { slot: "start", class: "codicon codicon-arrow-swap" })
                        ]),

                        m("vscode-button", {
                            type: "button", onclick: () => removeReleaseTest(current_index),
                            appearance: "secondary", style: "margin-bottom: 10px;"
                        }, [
                            m("", "Видалити цей тест"),
                            m("span", { slot: "start", class: "codicon codicon-trash" })
                        ])
                    ])),

                    // New test creation button
                    (model.on_release.tests.length < 100) && m("vscode-button", {
                        type: "button", onclick: appendReleaseTest,
                        appearance: "secondary", style: "margin-bottom: 10px;"
                    }, [
                        m("", "Додати ще один тест"),
                        m("span", { slot: "start", class: "codicon codicon-add" })
                    ])
                ])
            ])),
            /* --- On release configuration tab */
        ]),
        // Form actions component
        m(editor_components.formActionsComponent, { onsubmit: submitForm })
    ])
});
/* --- Build dynamic webview UI */