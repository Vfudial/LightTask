import { checkNPushNewTask, replaceTask } from '../main-menu/main.js'

export const CREATEBLOCK = (taskToEdit = -1) => {
	const isEditMode = taskToEdit !== -1 && Array.isArray(taskToEdit)

	// Безопасное извлечение значений с проверкой типа
	const getSafeValue = (index, defaultValue = '') => {
		if (!isEditMode) return defaultValue
		const value = taskToEdit[index]
		return value !== undefined && value !== null ? value : defaultValue
	}

	const taskName = getSafeValue(0, '')
	const taskDescription = getSafeValue(1, '').replace(/<br>/g, '\n')
	const taskCategory = getSafeValue(5, '')
	const deadlineTime = getSafeValue(8, '')
	const deadlineDate = getSafeValue(9, '')
	const endTime = getSafeValue(10, '')
	const endDate = getSafeValue(11, '')
	const urgencyValue = getSafeValue(3, false) ? 'Срочно' : 'Не срочно'
	const importanceValue = getSafeValue(4, false) ? 'Важно' : 'Не важно'

	return `
    <div id="blur">
        <form id="createForm">
            <div id="create-wrapper">
                <div id="desk">
                    <div id="top-desk">
                        <input type="text" name="task-name" placeholder="Название задачи" 
                            value="${escapeHtml(taskName)}" required />
                        <input type="text" name="task-category" placeholder="Категория" 
                            value="${escapeHtml(taskCategory)}" required />
                    </div>
                    <textarea
                        name="task-description"
                        id="task-description"
                        placeholder="Описание задачи"
                    >${escapeHtml(taskDescription)}</textarea>
                </div>

                <div class="datetime-block">
                    <table id="datetime-table">
                        <tr>
                            <td><h5>Дедлайн:</h5></td>
                            <td>
                                <input type="time" name="deadline-time" id="deadline-time" value="${deadlineTime}"/>
                            </td>
                            <td>
                                <input type="date" name="deadline-date" id="deadline-date" value="${deadlineDate}"/>
                            </td>
                        </tr>
                        <tr>
                            <td><h5>Сроки:</h5></td>
                            <td>
                                <input type="time" name="start-time" id="start-time" value="${getSafeValue(
																	12,
																	''
																)}"/>
                            </td>
                            <td>
                                <input type="date" name="start-date" id="start-date" value="${getSafeValue(
																	13,
																	''
																)}"/>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>
                                <input type="time" name="end-time" id="end-time" value="${endTime}"/>
                            </td>
                            <td>
                                <input type="date" name="end-date" id="end-date" value="${endDate}"/>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="urg-imp-block">
                    <select name="urgency-select" id="urgency-select">
                        <option value="Не срочно" ${
													urgencyValue === 'Не срочно' ? 'selected' : ''
												}>Не срочно</option>
                        <option value="Срочно" ${
													urgencyValue === 'Срочно' ? 'selected' : ''
												}>Срочно</option>
                    </select>

                    <select name="importance-select" id="importance-select">
                        <option value="Не важно" ${
													importanceValue === 'Не важно' ? 'selected' : ''
												}>Не важно</option>
                        <option value="Важно" ${
													importanceValue === 'Важно' ? 'selected' : ''
												}>Важно</option>
                    </select>
                </div>
            </div>
            <div id="submit-out-block">
                <input id="form-submit" type="submit" value="Подтвердить" />
                <button id="escape-button" type="button">Отмена</button>
            </div>
        </form>
    </div>
    `
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(unsafe) {
	if (typeof unsafe !== 'string') return unsafe
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

function transformFormData(formData) {
	const deadlineTime = formData.get('deadline-time') || ''
	const deadlineDate = formData.get('deadline-date') || ''
	const startTime = formData.get('start-time') || ''
	const startDate = formData.get('start-date') || ''
	const endTime = formData.get('end-time') || ''
	const endDate = formData.get('end-date') || ''

	const formatDate = (time, date) => {
		if (!time && !date) return 'не указан'
		const timePart = time ? time : ''
		const datePart = date ? new Date(date).toLocaleDateString() : ''
		return [timePart, datePart].filter(Boolean).join(' ')
	}

	return [
		formData.get('task-name') || 'Без названия',
		(formData.get('task-description') || '').replace(/\r?\n/g, '<br>'),
		formatDate(deadlineTime, deadlineDate),
		formData.get('urgency-select') === 'Срочно',
		formData.get('importance-select') === 'Важно',
		formData.get('task-category') || 'Без категории',
		false, // Полный вид
		false, // Завершённость
		deadlineTime,
		deadlineDate,
		endTime,
		endDate,
		startTime,
		startDate,
	]
}

export const displayElem = number => {
	const elems = [
		document.getElementById('blur'),
		document.getElementById('createForm'),
	].filter(Boolean)

	if (elems.length === 0) return

	elems.forEach(elem => {
		elem.style.display = number === 1 ? 'block' : 'none'
		elem.style.zIndex = number === 1 ? '1' : '-1'
	})
}

export const showCreateDisplay = TASKLIST => {
	// Удаляем предыдущую форму, если есть
	const oldBlur = document.getElementById('blur')
	if (oldBlur) oldBlur.remove()

	document.body.insertAdjacentHTML('beforeend', CREATEBLOCK())

	// Даем время на рендеринг DOM
	setTimeout(() => {
		const form = document.getElementById('createForm')
		if (!form) return

		form.addEventListener('submit', event => {
			event.preventDefault()
			const formData = new FormData(form)
			const newTask = transformFormData(formData)
			checkNPushNewTask(newTask)
			displayElem(-1)
			form.closest('#blur')?.remove()
		})

		setupAutofill()
		setupEscapeButton()
		displayElem(1)
	}, 50)
}

export const showEditDisplay = (taskData, taskIndex) => {
	// Удаляем предыдущую форму, если есть
	const oldBlur = document.getElementById('blur')
	if (oldBlur) oldBlur.remove()

	document.body.insertAdjacentHTML('beforeend', CREATEBLOCK(taskData))

	// Даем время на рендеринг DOM
	setTimeout(() => {
		const form = document.getElementById('createForm')
		if (!form) return

		form.addEventListener('submit', event => {
			event.preventDefault()
			const formData = new FormData(form)
			const editedTask = transformFormData(formData)

			// Сохраняем системные флаги
			editedTask[6] = taskData[6] // fullview
			editedTask[7] = taskData[7] // completed

			if (replaceTask(editedTask, taskIndex)) {
				displayElem(-1)
				form.closest('#blur')?.remove()
			}
		})

		setupAutofill()
		setupEscapeButton()
		displayElem(1)
	}, 50)
}

// Вспомогательные функции
function setupAutofill() {
	const deadLineTime = document.getElementById('deadline-time')
	const deadLineDate = document.getElementById('deadline-date')
	const endDateTime = document.getElementById('end-time')
	const endDateDate = document.getElementById('end-date')

	const autofill = (target, source) => {
		if (target && source) target.value = source.value
	}

	if (deadLineTime && endDateTime) {
		deadLineTime.addEventListener('input', () =>
			autofill(endDateTime, deadLineTime)
		)
	}
	if (deadLineDate && endDateDate) {
		deadLineDate.addEventListener('input', () =>
			autofill(endDateDate, deadLineDate)
		)
	}
	if (endDateDate && deadLineDate) {
		endDateDate.addEventListener('input', () =>
			autofill(deadLineDate, endDateDate)
		)
	}
	if (endDateTime && deadLineTime) {
		endDateTime.addEventListener('input', () =>
			autofill(deadLineTime, endDateTime)
		)
	}
}

function setupEscapeButton() {
	const escapeButton = document.getElementById('escape-button')
	if (escapeButton) {
		escapeButton.addEventListener('click', () => {
			displayElem(-1)
			document.getElementById('blur')?.remove()
		})
	}
}
