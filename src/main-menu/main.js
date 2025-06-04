import { FULLTASK } from '../full-task/full-task.js'
import { TASKPATTERN as taskPattern } from '../mini-task/mini-task.js'
import { CREATEBLOCK } from '../create-block/create-block.js'

document.body.insertAdjacentHTML('beforeend', CREATEBLOCK)
let TASKLIST = []
let tasks = document.getElementById('tasks')
const createBlur = document.getElementById('blur')
const createDisplay = document.getElementById('createForm')
const createButton = document.getElementById('createButton')
const importButton = document.getElementById('import-btn')
const exportButton = document.getElementById('export-btn')
const fulltaskContainer = document.getElementById('fulltask-container')
let fullTaskId = 0

// Обработчики событий
importButton.addEventListener('click', openFile)
exportButton.addEventListener('click', saveFile)
tasks.addEventListener('click', event =>
	onClickToTasks(event, '.task-container')
)
fulltaskContainer.addEventListener('click', event =>
	onClickToTasks(event, '#fulltask-block')
)

// Асинхронная функция загрузки списка задач
async function loadAndRenderTaskList() {
	try {
		const taskList = await window.electronAPI.loadTaskList()
		TASKLIST = taskList
		render()
		for (let index = 0; index < TASKLIST.length; index++) {
			if (TASKLIST[index][6] === true) {
				selectFullView(index)
				break
			}
		}
	} catch (error) {
		console.error('Ошибка при загрузке списка задач:', error)
		window.electronAPI.showError(
			'Ошибка загрузки списка задач: ' + error.message
		) // Отправляем сообщение об ошибке
	}
}

// Асинхронная функция сохранения списка задач
async function saveTaskList() {
	try {
		const success = await window.electronAPI.saveTaskList(TASKLIST)
		if (!success) {
			console.error('Ошибка сохранения списка задач!')
			// Обработка ошибки: можно отобразить сообщение об ошибке пользователю
		}
	} catch (error) {
		console.error('Ошибка сохранения списка задач:', error)
		// Обработка ошибки: можно отобразить сообщение об ошибке пользователю
	}
}

// Функция открытия файла
async function openFile() {
	try {
		const loadedTasks = await window.electronAPI.openFile()
		if (loadedTasks !== null) {
			// Проверка на null
			TASKLIST = loadedTasks
			saveTaskList()
			render()
		} else {
			// Обработка ошибки (файл не выбран или ошибка при загрузке)
			console.log('File load canceled.')
		}
	} catch (error) {
		console.error('Общая ошибка при открытии файла:', error)
		window.electronAPI.showError('Неизвестная ошибка при открытии файла.')
	}
}

// Функция сохранения файла
async function saveFile() {
	try {
		const data = JSON.stringify(TASKLIST) // Преобразуем данные в JSON
		const result = await window.electronAPI.saveFile(data)
		if (result && result.filePath) {
			console.log('File saved to:', result.filePath)
		} else if (result && result.error) {
			console.error('Error:', result.error)
			// Обработка ошибки: можно отобразить сообщение об ошибке пользователю
		} else {
			console.log('File save canceled.')
		}
	} catch (error) {
		console.error('Failed to save file:', error)
		// Обработка ошибки: можно отобразить сообщение об ошибке пользователю
	}
}

const blurTask = (number, elem) => {
	if (number === 1) {
		elem.style.zIndex = 1
		elem.style.visibility = 'visible'
		return
	}
	elem.style.zIndex = -1
	elem.style.visibility = 'hidden'
}
function render() {
	tasks.innerHTML = ''
	let index = 0
	TASKLIST.forEach(task => {
		tasks.insertAdjacentHTML('beforeend', taskPattern(task, index))
		const taskHTMLBlur = document.getElementById(`blur-task-${index}`)
		task[6] ? blurTask(1, taskHTMLBlur) : blurTask(0, taskHTMLBlur)
		index++
	})
	if (TASKLIST.length === 0) {
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
			for (let index = 0; index < TASKLIST.length; index++) {
				if (TASKLIST[fullTaskId] !== undefined) {
					fulltaskContainer.insertAdjacentHTML(
						'afterbegin',
						FULLTASK(TASKLIST[index], index)
					)
				}
			}
		}
	}
}

function selectFullView(index) {
	if (TASKLIST.length > 0) {
		fullTaskId = index
		for (let i = 0; i < TASKLIST.length; i++) {
			TASKLIST[i][6] = false
		}
		TASKLIST[index][6] = true
		saveTaskList()
	}
	render()
}
function onClickToTasks(event, replaceTarget) {
	console.log('onClickToTasks')
	const taskContainer = event.target.closest(replaceTarget)
	if (taskContainer === null) return
	const stringIndex = taskContainer.dataset.index
	if (stringIndex) {
		const index = parseInt(stringIndex)
		const type = event.target.dataset.type
		if (type === 'toggle') {
			TASKLIST[index].completed = !TASKLIST[index].completed
		} else if (type === 'remove') {
			console.log('remove ' + index)
			TASKLIST.splice(index, 1)
			if (fullTaskId === index) {
				if (TASKLIST.length === 0) {
					fullTaskId = -1
					render()
					return
				}
				fullTaskId = 0
			}
		} else selectFullView(index)
		render()
		saveTaskList()
	}
}
function transformFormData(formData) {
	const deadlineTime = formData.get('deadline-time')
	const deadlineDate = formData.get('deadline-date')
	function isEmpty(data, insertDate) {
		return data == '' ? '' : insertDate
	}
	let deadline = `${deadlineTime}${isEmpty(deadlineTime, ' ')}${isEmpty(
		deadlineDate,
		new Date(deadlineDate).toLocaleDateString()
	)}`

	return [
		formData.get('task-name'),
		formData.get('task-description'),
		deadline === ' ' ? 'не указан' : deadline,
		formData.get('urgency-select') === 'Срочно',
		formData.get('importance-select') === 'Важно',
		formData.get('task-category'),
		false, // Полный вид
		false, // Завершённость
	]
}

function submitCreate(event) {
	event.preventDefault()
	const formData = new FormData(createDisplay)
	const newTask = transformFormData(formData)
	console.log('New Task Data: ', newTask)
	let inTaskList
	if (TASKLIST.length > 0) {
		inTaskList = true
		TASKLIST.forEach(task => {
			for (let i = 0; i < newTask.length; i++) {
				if (i !== 6) {
					if (task[i] !== newTask[i]) {
						inTaskList = false
						return
					}
				}
			}
		})
	} else inTaskList = false
	if (!inTaskList) {
		TASKLIST.push(newTask)
		displayElem(-1, createBlur, createDisplay)
		render()
		saveTaskList()
		selectFullView(TASKLIST.indexOf(newTask))
	} else {
		alert('Такая задача уже существует!')
	}

	createForm.reset()
}

const displayElem = (number, ...elems) => {
	switch (number) {
		case 1:
			for (let elem of elems) {
				elem.style.display = 'block'
				elem.style.zIndex = 1
			}
			return

		case -1:
			for (let elem of elems) {
				elem.style.display = 'none'
				elem.style.zIndex = -1
			}
			return
	}
}

const hideCreateDisplay = event => {
	if (
		event.target.closest('form') === null &&
		event.target.id !== 'createButton'
	) {
		displayElem(-1, createBlur, createDisplay)
	}
}

const showCreateDisplay = () => {
	const escapeButton = document.getElementById('escape-button')
	const deadLineTime = document.getElementById('deadline-time')
	const deadLineDate = document.getElementById('deadline-date')
	const endDateTime = document.getElementById('end-time')
	const endDateDate = document.getElementById('end-date')

	document.body.addEventListener('click', hideCreateDisplay)
	displayElem(1, createBlur, createDisplay)
	escapeButton.addEventListener('click', () =>
		displayElem(-1, createBlur, createDisplay)
	)

	function autofill(targetInput, sourceInput) {
		targetInput.value = sourceInput.value
	}
	function addAutofillListeners(source, target) {
		source.addEventListener('input', () => {
			autofill(target, source)
		})
	}
	addAutofillListeners(deadLineTime, endDateTime)
	addAutofillListeners(deadLineDate, endDateDate)
	addAutofillListeners(endDateDate, deadLineDate)
	addAutofillListeners(endDateTime, deadLineTime)

	createForm.addEventListener('submit', submitCreate)
}
createButton.addEventListener('click', showCreateDisplay)

loadAndRenderTaskList()
