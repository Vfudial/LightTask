const fs = require('fs')
import { FULLTASK } from '../full-task/full-task.js'
import { CREATEBLOCK } from '../create-block/create-block.js'
import { TASKPATTERN as taskPattern } from '../mini-task/mini-task.js'

document.body.insertAdjacentHTML('beforeend', CREATEBLOCK())
let TASKLIST = []
let tasks = document.getElementById('tasks')
const createForm = document.getElementById('createForm')
const createBlur = document.getElementById('blur')
const createDisplay = document.getElementById('createForm')
const createButton = document.getElementById('createButton')
const fulltaskContainer = document.getElementById('fulltask-container')
let fullTaskId = 0

async function loadTaskList() {
	try {
		const filePath = 'taskList.js'
		const taskListData = fs.readFileSync(filePath, 'utf8')
		TASKLIST = eval(taskListData)
		console.log('TASKLIST:', TASKLIST)
		render()
	} catch (error) {
		console.error('Failed to load task list:', error)
	}
}

function saveTaskList() {
	try {
		const filePath = 'taskList.js'
		const data = `module.exports = TASKLIST = ${JSON.stringify(
			TASKLIST,
			null,
			2
		)}`
		fs.writeFileSync(filePath, data, 'utf8')
		console.log('Task list saved successfully')
	} catch (error) {
		console.error('Failed to save task list:', error)
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
		task[7] ? blurTask(1, taskHTMLBlur) : blurTask(0, taskHTMLBlur)
		index++
	})
	if (TASKLIST.length === 0) {
		tasks.insertAdjacentHTML(
			'afterbegin',
			'<p id="empty-tasks">Задачи отсутствуют</p>'
		)
	} else {
		fulltaskContainer.innerHTML = ''
		fulltaskContainer.insertAdjacentHTML(
			'afterbegin',
			FULLTASK(TASKLIST[fullTaskId], fullTaskId)
		)
	}
}

function onClickToTasks(event, replaceTarget) {
	const taskContainer = event.target.closest(replaceTarget)
	if (taskContainer === null) return
	const stringIndex = taskContainer.dataset.index
	if (stringIndex) {
		const index = parseInt(stringIndex)
		const type = event.target.dataset.type
		if (type === 'toggle') {
			TASKLIST[index].completed = !TASKLIST[index].completed
			saveTaskList()
		} else if (type === 'remove') {
			TASKLIST.splice(index, 1)
			saveTaskList()
			if (fullTaskId === index) {
				fullTaskId = 0
				render()
				return
			}
		} else {
			fullTaskId = index
			for (let i = 0; i < TASKLIST.length; i++) {
				TASKLIST[i][7] = false
			}
			TASKLIST[index][7] = true
		}

		render()
	}
}
tasks.addEventListener('click', event =>
	onClickToTasks(event, '.task-container')
)
fulltaskContainer.addEventListener('click', event =>
	onClickToTasks(event, '#fulltask-block')
)

function getTaskName() {
	return document.querySelector('input[placeholder="Название задачи"]').value
}

function getCategory() {
	return document.querySelector('input[placeholder="Категория"]').value
}

function transformFormData(formData) {
	let taskName = getTaskName()
	let category = getCategory()

	const deadlineTime = formData.get('deadline-time')
	const deadlineDate = formData.get('deadline-date')
	let deadline
	function isEmpty(data, insertDate) {
		return data == '' ? '' : insertDate
	}
	deadline = `${deadlineTime}${isEmpty(deadlineTime, ' ')}${isEmpty(
		deadlineDate,
		new Date(deadlineDate).toLocaleDateString()
	)}`
	return [
		taskName,
		formData.get('task-description'),
		deadline !== ' ' ? 'не указан' : ' ',
		formData.get('urgency-select') === 'Срочно',
		formData.get('importance-select') === 'Важно',
		category,
		false,
	]
}

function submitCreate(event) {
	event.preventDefault()
	const formData = new FormData(createForm)
	const newTask = transformFormData(formData)
	console.log('New Task Data: ', newTask)
	TASKLIST.push(newTask)
	displayElem(-1, createBlur, createDisplay)
	render()
	saveTaskList()
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

loadTaskList()
