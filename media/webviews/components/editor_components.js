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

export const headerComponent = {
    view: (vnode) => m("div", [
        m("h2", { style: "margin-bottom: 2px;" }, vnode.attrs.title),
        m("p", vnode.attrs.description),
        m("vscode-divider", { style: "margin-top: 10px; margin-bottom: 10px;" })
    ])
};

export const formActionsComponent = {
    isLoading: false,
    view: (vnode) => m("div", { class: "form-actions" }, [
        m("p", [
            m("span", "Перед початком роботи з Task Generator радимо "),
            m("vscode-link", { href: "https://docs.overtest.sirkadirov.com/" }, "переглянути документацію")
        ]),
        // Submit button with handler
        !vnode.state.isLoading && m("vscode-button", {
            type: "button", style: "margin-right: 10px;",
            onclick: () => {
                // Enable loading state
                vnode.state.isLoading = true;
                m.redraw();
                // Call external submit handler
                vnode.attrs.onsubmit();
                // Disable loading state
                vnode.state.isLoading = false;
                m.redraw();
            }
        }, [
            m("", "Застосувати зміни"),
            m("span", { slot: "start", class: "codicon codicon-save" })
        ]),
        // Loading progress bar
        vnode.state.isLoading && m("vscode-progress-ring")
    ])
};