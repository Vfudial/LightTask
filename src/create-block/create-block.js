import { escapeHtml } from '../mini-task/mini-task.js';
import { checkNPushNewTask } from '../main-menu/main.js'
export const CREATEBLOCK = (taskToEdit = -1) => {
    const isEditMode = Array.isArray(taskToEdit);
    const getValue = (index, def = '') => isEditMode ? taskToEdit[index] || def : def;

    return `
    <div id="blur">
        <form id="createForm">
            <div id="create-wrapper">
                <div id="desk">
                    <div id="top-desk">
                        <input type="text" name="task-name" placeholder="Название задачи" 
                            value="${escapeHtml(getValue(0))}" required>
                        <input type="text" name="task-category" placeholder="Категория" 
                            value="${escapeHtml(getValue(5))}" required>
                    </div>
                    <textarea name="task-description" id="task-description" placeholder="Описание задачи"
                        >${escapeHtml(getValue(1))}</textarea>
                </div>

                <div class="datetime-block">
                    <table id="datetime-table">
                        <tr>
                            <td><h5>Дедлайн:</h5></td>
                            <td><input type="time" name="deadline-time" value="${getValue(8)}"></td>
                            <td><input type="date" name="deadline-date" value="${getValue(9)}"></td>
                        </tr>
                        <tr>
                            <td><h5>Сроки:</h5></td>
                            <td><input type="time" name="start-time" value="${getValue(12)}"></td>
                            <td><input type="date" name="start-date" value="${getValue(13)}"></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><input type="time" name="end-time" value="${getValue(10)}"></td>
                            <td><input type="date" name="end-date" value="${getValue(11)}"></td>
                        </tr>
                    </table>
                </div>

                <div class="urg-imp-block">
                    <select name="urgency-select" id="urgency-select">
                        <option value="Не срочно" ${getValue(3, false) ? '' : 'selected'}>Не срочно</option>
                        <option value="Срочно" ${getValue(3, false) ? 'selected' : ''}>Срочно</option>
                    </select>
                    <select name="importance-select" id="importance-select">
                        <option value="Не важно" ${getValue(4, false) ? '' : 'selected'}>Не важно</option>
                        <option value="Важно" ${getValue(4, false) ? 'selected' : ''}>Важно</option>
                    </select>
                </div>
            </div>
            <div id="submit-out-block">
                <input id="form-submit" type="submit" value="${isEditMode ? 'Обновить' : 'Создать'}">
                <button id="escape-button" type="button">Отмена</button>
            </div>
        </form>
    </div>`;
};

export const displayElem = number => {
    const elems = [document.getElementById('blur'), document.getElementById('createForm')].filter(Boolean);
    elems.forEach(elem => {
        elem.style.display = number === 1 ? 'block' : 'none';
        elem.style.zIndex = number === 1 ? '1000' : '-1';
    });
};

export const showCreateDisplay = (TASKLIST) => {
    const oldBlur = document.getElementById('blur');
    if (oldBlur) oldBlur.remove();

    document.body.insertAdjacentHTML('beforeend', CREATEBLOCK());

    setTimeout(() => {
        const form = document.getElementById('createForm');
        if (!form) return;

        form.addEventListener('submit', event => {
            event.preventDefault();
            const newTask = transformFormData(new FormData(form));
            if (checkNPushNewTask(newTask)) {
                displayElem(-1);
                form.remove();
                window.render?.();
                window.selectFullView?.(TASKLIST.length - 1);
            }
        });

        setupAutofill();
        setupEscapeButton();
        displayElem(1);
        form.querySelector('input')?.focus();
    }, 50);
};

export const showEditDisplay = (taskData, taskIndex) => {
    const oldBlur = document.getElementById('blur');
    if (oldBlur) oldBlur.remove();

    document.body.insertAdjacentHTML('beforeend', CREATEBLOCK(taskData));

    setTimeout(() => {
        const form = document.getElementById('createForm');
        if (!form) return;

        form.addEventListener('submit', event => {
            event.preventDefault();
            const editedTask = transformFormData(new FormData(form));
            if (window.replaceTask?.(editedTask, taskIndex)) {
                displayElem(-1);
                form.remove();
                window.render?.();
            }
        });

        setupAutofill();
        setupEscapeButton();
        displayElem(1);
    }, 50);
};

function transformFormData(formData) {
    const getValue = name => formData.get(name) || '';
    return [
        getValue('task-name') || 'Без названия',
        (getValue('task-description') || '').replace(/\r?\n/g, '<br>'),
        `${getValue('deadline-time')} ${getValue('deadline-date')}`.trim() || 'не указан',
        getValue('urgency-select') === 'Срочно',
        getValue('importance-select') === 'Важно',
        getValue('task-category') || 'Без категории',
        false, // fullview
        false, // completed
        getValue('deadline-time'),
        getValue('deadline-date'),
        getValue('end-time'),
        getValue('end-date'),
        getValue('start-time'),
        getValue('start-date')
    ];
}

function setupAutofill() {
    const timePairs = [
        ['deadline-time', 'end-time'],
        ['deadline-date', 'end-date']
    ];

    timePairs.forEach(([source, target]) => {
        const sourceElem = document.getElementById(source);
        const targetElem = document.getElementById(target);
        if (sourceElem && targetElem) {
            sourceElem.addEventListener('input', () => {
                targetElem.value = sourceElem.value;
            });
        }
    });
}

function setupEscapeButton() {
    const escapeButton = document.getElementById('escape-button');
    if (escapeButton) {
        escapeButton.addEventListener('click', () => {
            displayElem(-1);
            document.getElementById('blur')?.remove();
        });
    }
}