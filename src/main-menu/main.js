import { FULLTASK } from '../full-task/full-task.js'
import { FILTER_MENU } from '../filter/filter.js'
import { TASKPATTERN as taskPattern, blurTask } from '../mini-task/mini-task.js'
import {
	CREATEBLOCK,
	showCreateDisplay,
	displayElem,
} from '../create-block/create-block.js'

document.body.insertAdjacentHTML('beforeend', CREATEBLOCK)
let TASKLIST = []
let tasks = document.getElementById('tasks')
const filterButton = document.getElementById('filter-btn')
const createButton = document.getElementById('createButton')
const importButton = document.getElementById('import-btn')
const exportButton = document.getElementById('export-btn')
const fulltaskContainer = document.getElementById('fulltask-container')
let fullTaskId = 0
let currentFilter = []
let filterMenu = null
function initEventListeners() {
	importButton.addEventListener('click', openFile)
	exportButton.addEventListener('click', saveFile)
	tasks.addEventListener('click', event =>
		onClickToTasks(event, '.task-container')
	)
	fulltaskContainer.addEventListener('click', event =>
		onClickToTasks(event, '#fulltask-block')
	)
}
initEventListeners()

async function loadAndRenderTaskList() {
	try {
		const taskList = await window.electronAPI.loadTaskList()
		TASKLIST = taskList || []
		currentFilter = []
		render()

		const fullViewTaskIndex = TASKLIST.findIndex(task => task[6])
		if (fullViewTaskIndex !== -1) {
			selectFullView(fullViewTaskIndex)
		} else if (TASKLIST.length > 0) {
			selectFullView(0)
		}
	} catch (error) {
		console.error('Ошибка загрузки:', error)
		window.electronAPI.showError('Ошибка загрузки задач')
	}
}
async function openFile() {
	try {
		const loadedTasks = await window.electronAPI.openFile()
		if (loadedTasks !== null) {
			TASKLIST = loadedTasks
			saveTaskList()
			render()
		} else {
			console.log('File load canceled.')
		}
	} catch (error) {
		console.error('Общая ошибка при открытии файла:', error)
		window.electronAPI.showError('Неизвестная ошибка при открытии файла.')
	}
}
async function saveFile() {
	try {
		const data = JSON.stringify(TASKLIST)
		const result = await window.electronAPI.saveFile(data)
		if (result && result.filePath) {
			console.log('File saved to:', result.filePath)
		} else if (result && result.error) {
			console.error('Error:', result.error)
		} else {
			console.log('File save canceled.')
		}
	} catch (error) {
		console.error('Failed to save file:', error)
	}
}
export async function saveTaskList() {
	try {
		const success = await window.electronAPI.saveTaskList(TASKLIST)
		if (!success) {
			console.error('Ошибка сохранения списка задач!')
		}
	} catch (error) {
		console.error('Ошибка сохранения списка задач:', error)
	}
}

function render() {
	let index = 0
	tasks.innerHTML = ''

	const filteredTasks =
		currentFilter.length === 0
			? TASKLIST
			: TASKLIST.filter(task => currentFilter.includes(task[5]))

	filteredTasks.forEach(task => {
		tasks.insertAdjacentHTML('beforeend', taskPattern(task, index))
		const taskHTMLBlur = document.getElementById(`blur-task-${index}`)

		if (taskHTMLBlur) {
			task[6] ? blurTask(1, taskHTMLBlur) : blurTask(0, taskHTMLBlur)
		}

		index++
	})

	if (filteredTasks.length === 0) {
		tasks.insertAdjacentHTML(
			'afterbegin',
			'<p id="empty-tasks">Задачи отсутствуют</p>'
		)
		if (fullTaskId == -1) {
			fulltaskContainer.innerHTML = ''
		}
	} else {
		fulltaskContainer.innerHTML = ''
		if (TASKLIST[fullTaskId] !== undefined) {
			fulltaskContainer.insertAdjacentHTML(
				'afterbegin',
				FULLTASK(TASKLIST[fullTaskId], fullTaskId)
			)
		} else {
			const defaultTask = TASKLIST[0]
			if (defaultTask) {
				fulltaskContainer.insertAdjacentHTML(
					'afterbegin',
					FULLTASK(defaultTask, 0)
				)
			}
		}
	}
}

function selectFullView(index) {
	if (TASKLIST.length > 0 && index >= 0 && index < TASKLIST.length) {
		TASKLIST.forEach(task => (task[6] = false))

		TASKLIST[index][6] = true
		fullTaskId = index

		fulltaskContainer.innerHTML = ''
		fulltaskContainer.insertAdjacentHTML(
			'afterbegin',
			FULLTASK(TASKLIST[index], index)
		)

		saveTaskList()
	} else {
		fulltaskContainer.innerHTML = ''
		fullTaskId = -1
	}
}

function onClickToTasks(event, replaceTarget) {
	const taskContainer = event.target.closest(replaceTarget)
	if (!taskContainer) return

	const stringIndex = taskContainer.dataset.index
	if (!stringIndex) return

	const index = parseInt(stringIndex)
	const type = event.target.dataset.type

	if (index < 0 || index >= TASKLIST.length) return

	if (type === 'toggle') {
		TASKLIST[index].completed = !TASKLIST[index].completed
	} else if (type === 'remove') {
		if (fullTaskId === index) {
			fullTaskId = TASKLIST.length > 1 ? 0 : -1
		} else if (fullTaskId > index) {
			fullTaskId--
		}
		TASKLIST.splice(index, 1)
	} else {
		selectFullView(index)
	}

	render()
	saveTaskList()
}

createButton.addEventListener('click', (event, TASKLIST) => {
	showCreateDisplay(event, TASKLIST)
})

export const checkNPushNewTask = newTask => {
	if (!newTask || newTask.length === 0 || !newTask[0]?.trim()) {
		console.warn('Попытка добавить пустую задачу')
		return
	}

	let taskExists = false

	for (const task of TASKLIST) {
		let matchCount = 0

		for (let i = 0; i < Math.min(task.length, newTask.length); i++) {
			if (i !== 6 && i !== 7) {
				if (String(task[i]).trim() === String(newTask[i]).trim()) matchCount++
			}
		}

		if (matchCount === newTask.length - 2) {
			taskExists = true
			break
		}
	}
	if (!taskExists) {
		TASKLIST.push(newTask)
		displayElem(-1)
		render()
		saveTaskList()
		selectFullView(TASKLIST.length - 1)

		if (filterMenu && !filterMenu.classList.contains('hidden'))
			setupFilterMenu()
	} else {
		alert('Такая задача уже существует!')
	}
}

function toggleFilterMenu() {
	if (!filterMenu) {
		document.body.insertAdjacentHTML('beforeend', FILTER_MENU())
		filterMenu = document.getElementById('filter-menu')
		setupFilterMenu()
	}

	filterMenu.classList.toggle('hidden')
}

function setupFilterMenu() {
	const filterOptions = document.getElementById('filter-options')
	const applyBtn = document.getElementById('apply-filter')
	const cancelBtn = document.getElementById('cancel-filter')

	const allCategories = [
		...new Set(TASKLIST.flatMap(task => (task[5] ? [task[5]] : []))),
	]

	filterOptions.innerHTML = allCategories
		.map(
			category => `
    <div class="filter-option">
      <input type="checkbox" id="filter-${category}" value="${category}"
        ${currentFilter.includes(category) ? 'checked' : ''}>
      <label for="filter-${category}">${category}</label>
    </div>
  `
		)
		.join('')

	applyBtn.onclick = () => {
		const checkboxes = filterOptions.querySelectorAll(
			'input[type="checkbox"]:checked'
		)
		currentFilter = Array.from(checkboxes).map(cb => cb.value)
		render()
		filterMenu.classList.add('hidden')
	}
	cancelBtn.onclick = () => {
		filterMenu.classList.add('hidden')
	}
}
filterButton.addEventListener('click', toggleFilterMenu)

loadAndRenderTaskList()

export { loadAndRenderTaskList, displayElem, initEventListeners }
