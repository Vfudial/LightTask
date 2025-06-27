import { FULLTASK } from '../full-task/full-task.js';
import { FILTER_MENU } from '../filter/filter.js';
import { TASKPATTERN as taskPattern } from '../mini-task/mini-task.js';
import {
    CREATEBLOCK,
    showCreateDisplay,
    displayElem,
    showEditDisplay
} from '../create-block/create-block.js';

document.body.insertAdjacentHTML('beforeend', CREATEBLOCK());
let TASKLIST = [];
let tasks = document.getElementById('tasks');
const filterButton = document.getElementById('filter-btn');
const createButton = document.getElementById('createButton');
const importButton = document.getElementById('import-btn');
const exportButton = document.getElementById('export-btn');
const fulltaskContainer = document.getElementById('fulltask-container');
let fullTaskId = 0;
let currentFilter = [];
let filterMenu = null;

function initEventListeners() {
    importButton.addEventListener('click', openFile);
    exportButton.addEventListener('click', saveFile);
    tasks.addEventListener('click', event => onClickToTasks(event, '.task-container'));
    tasks.addEventListener('dblclick', event => onDoubleClickToTasks(event, '.task-container'));
    fulltaskContainer.addEventListener('click', event => onClickToTasks(event, '#fulltask-block'));
    createButton.addEventListener('click', handleCreateTask);
}
initEventListeners();

async function loadAndRenderTaskList() {
    try {
        const taskList = await window.electronAPI.loadTaskList();
        TASKLIST = taskList || [];
        currentFilter = [];
        render();

        const fullViewTaskIndex = TASKLIST.findIndex(task => task[6]);
        if (fullViewTaskIndex !== -1) {
            selectFullView(fullViewTaskIndex);
        } else if (TASKLIST.length > 0) {
            selectFullView(0);
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        window.electronAPI.showError('Ошибка загрузки задач');
    }
}

async function openFile() {
    try {
        const loadedTasks = await window.electronAPI.openFile();
        if (loadedTasks !== null) {
            TASKLIST = loadedTasks;
            saveTaskList();
            render();
        }
    } catch (error) {
        console.error('Ошибка при открытии файла:', error);
        window.electronAPI.showError('Неизвестная ошибка при открытии файла.');
    }
}

async function saveFile() {
    try {
        const result = await window.electronAPI.saveFile(JSON.stringify(TASKLIST));
        if (result?.filePath) {
            console.log('Файл сохранен:', result.filePath);
        }
    } catch (error) {
        console.error('Ошибка сохранения файла:', error);
    }
}

export async function saveTaskList() {
    try {
        await window.electronAPI.saveTaskList(TASKLIST);
    } catch (error) {
        console.error('Ошибка сохранения списка задач:', error);
    }
}

function render() {
    tasks.innerHTML = '';
    const filteredTasks = currentFilter.length === 0 
        ? TASKLIST 
        : TASKLIST.filter(task => currentFilter.includes(task[5]));

    filteredTasks.forEach((task, index) => {
        tasks.insertAdjacentHTML('beforeend', taskPattern(task, index));
        const taskElement = document.querySelector(`.task-container[data-index="${index}"]`);
        if (taskElement) {
            taskElement.classList.toggle('selected', task[6]);
        }
    });

    if (filteredTasks.length === 0) {
        tasks.insertAdjacentHTML('afterbegin', '<p id="empty-tasks">Задачи отсутствуют</p>');
        if (fullTaskId === -1) {
            fulltaskContainer.innerHTML = '';
        }
    } else {
        updateFullTaskView();
    }
    
    window.updateFilters?.();
}

function updateFullTaskView() {
    fulltaskContainer.innerHTML = '';
    if (TASKLIST[fullTaskId] !== undefined) {
        fulltaskContainer.insertAdjacentHTML('afterbegin', FULLTASK(TASKLIST[fullTaskId], fullTaskId));
    } else if (TASKLIST.length > 0) {
        selectFullView(0);
    }
}

function selectFullView(index) {
    TASKLIST.forEach(task => task[6] = false);
    document.querySelectorAll('.task-container').forEach(container => {
        container.classList.remove('selected');
        container.querySelector('.task-blur')?.remove();
    });
    
    if (index >= 0 && index < TASKLIST.length) {
        TASKLIST[index][6] = true;
        fullTaskId = index;
        
        const taskElement = document.querySelector(`.task-container[data-index="${index}"]`);
        if (taskElement) {
            taskElement.classList.add('selected');
            taskElement.insertAdjacentHTML('beforeend', '<div class="task-blur"></div>');
        }
        
        updateFullTaskView();
    } else {
        fulltaskContainer.innerHTML = '';
        fullTaskId = -1;
    }
    saveTaskList();
}


let clickTimeout = null;

function onClickToTasks(event, replaceTarget) {
    if (clickTimeout !== null) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
        return;
    }

    clickTimeout = setTimeout(() => {
        clickTimeout = null;
        handleSingleClick(event, replaceTarget);
    }, 200);
}

function onDoubleClickToTasks(event, replaceTarget) {
    if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
    }
    handleDoubleClick(event, replaceTarget);
}

function handleSingleClick(event, replaceTarget) {
    const taskContainer = event.target.closest(replaceTarget);
    if (!taskContainer) return;

    const index = parseInt(taskContainer.dataset.index);
    if (isNaN(index)) return;

    const type = event.target.dataset.type;
    if (type === 'toggle') {
        TASKLIST[index].completed = !TASKLIST[index].completed;
    } else if (type === 'remove') {
        removeTask(index);
    } else {
        selectFullView(index);
    }
    render();
    saveTaskList();
}

function removeTask(index) {
    const wasSelected = TASKLIST[index][6];
    TASKLIST.splice(index, 1);
    
    if (wasSelected) {
        const newIndex = TASKLIST.length > 0 ? Math.min(index, TASKLIST.length - 1) : -1;
        if (newIndex >= 0) {
            selectFullView(newIndex);
        } else {
            fulltaskContainer.innerHTML = '';
            fullTaskId = -1;
        }
    } else if (fullTaskId > index) {
        fullTaskId--;
    }
}

function handleDoubleClick(event, replaceTarget) {
    const taskContainer = event.target.closest(replaceTarget);
    if (!taskContainer) return;

    const index = parseInt(taskContainer.dataset.index);
    if (!isNaN(index) && index >= 0 && index < TASKLIST.length) {
        showEditDisplay(TASKLIST[index], index);
    }
}

function handleCreateTask() {
    createButton.blur();
    showCreateDisplay(TASKLIST);
}

const checkNPushNewTask = newTask => {
    if (!newTask?.length || !newTask[0]?.trim()) return false;

    const normalize = str => String(str).trim().toLowerCase();
    const isDuplicate = TASKLIST.some(task => 
        normalize(task[0]) === normalize(newTask[0]) &&
        normalize(task[1]) === normalize(newTask[1]) &&
        normalize(task[5]) === normalize(newTask[5])
    );

    if (!isDuplicate) {
        TASKLIST.push(newTask);
        saveTaskList();
        render()
        return true;
    } else {
        showDuplicateAlert();
        return false;
    }
};

function showDuplicateAlert() {
    if (!window.alertShown) {
        window.alertShown = true;
        setTimeout(() => window.alertShown = false, 100);
        window.alert('Такая задача уже существует!');
    }
}

function replaceTask(newTask, index) {
    if (!newTask || index < 0 || index >= TASKLIST.length) return false;

    const normalize = str => String(str).trim().toLowerCase();
    const isDuplicate = TASKLIST.some((task, i) => 
        i !== index &&
        normalize(task[0]) === normalize(newTask[0]) &&
        normalize(task[1]) === normalize(newTask[1]) &&
        normalize(task[5]) === normalize(newTask[5])
    );

    if (!isDuplicate) {
        newTask[6] = TASKLIST[index][6];
        newTask[7] = TASKLIST[index][7];
        TASKLIST[index] = newTask;
        saveTaskList();
        return true;
    } else {
        showDuplicateAlert();
        return false;
    }
}

function toggleFilterMenu() {
    if (!filterMenu) createFilterMenu();
    filterMenu?.classList.toggle('hidden');
}

function createFilterMenu() {
    document.body.insertAdjacentHTML('beforeend', FILTER_MENU());
    filterMenu = document.getElementById('filter-menu');
    document.getElementById('apply-filter').addEventListener('click', applyFilter);
    document.getElementById('cancel-filter').addEventListener('click', cancelFilter);
    updateFilterOptions();
}

function updateFilterOptions() {
    if (!filterMenu) return;
    
    const categories = [...new Set(TASKLIST.map(task => task[5]).filter(Boolean))];
    document.getElementById('filter-options').innerHTML = categories.map(category => `
        <div class="filter-option">
            <input type="checkbox" id="filter-${category}" value="${category}"
                ${currentFilter.includes(category) ? 'checked' : ''}>
            <label for="filter-${category}">${category}</label>
        </div>
    `).join('');
}

function applyFilter() {
    const checkboxes = document.querySelectorAll('#filter-options input:checked');
    currentFilter = Array.from(checkboxes).map(cb => cb.value);
    render();
    filterMenu.classList.add('hidden');
}

function cancelFilter() {
    filterMenu.classList.add('hidden');
}

filterButton.addEventListener('click', toggleFilterMenu);
window.updateFilters = updateFilterOptions;

loadAndRenderTaskList();

export {
    replaceTask,
    checkNPushNewTask,
    loadAndRenderTaskList,
    displayElem,
    initEventListeners
};