import { checkNPushNewTask } from '../main-menu/main.js'
export const CREATEBLOCK = (taskToEdit = -1) =>
	`
		<div id="blur">
			<form id="createForm">
				<div id="create-wrapper">
					<div id="desk">
						<div id="top-desk">
							<input type="text" name="task-name" placeholder="Название задачи" required />
							<input type="text" name="task-category" placeholder="Категория" required />
						</div>
						<textarea
							name="task-description"
							id="task-description"
							placeholder="Описание задачи"
						></textarea>
					</div>

					<div class="datetime-block">
						<table id="datetime-table">
							<tr>
								<td><h5>Дедлайн:</h5></td>
								<td>
									<input type="time" name="deadline-time" id="deadline-time" />
								</td>
								<td>
									<input type="date" name="deadline-date" id="deadline-date" />
								</td>
							</tr>
							<tr>
								<td><h5>Сроки:</h5></td>
								<td>
									<input type="time" name="start-time" id="start-time" />
								</td>
								<td>
									<input type="date" name="start-date" id="start-date" />
								</td>
							</tr>
							<tr>
								<td></td>
								<td>
									<input type="time" name="end-time" id="end-time" />
								</td>
								<td>
									<input type="date" name="end-date" id="end-date" />
								</td>
							</tr>
						</table>
					</div>

					<div class="urg-imp-block">
						<select name="urgency-select" id="urgency-select">
							<option selected>Не срочно</option>
							<option>Срочно</option>
						</select>

						<select name="importance-select" id="importance-select">
							<option selected>Не важно</option>
							<option>Важно</option>
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
		formData.get('task-description').replace(/\r?\n/g, '<br>'),
		deadline === '' ? 'не указан' : deadline,
		formData.get('urgency-select') === 'Срочно',
		formData.get('importance-select') === 'Важно',
		formData.get('task-category'),
		false, // Полный вид
		false, // Завершённость
	]
}

function submitCreate(event) {
	const createDisplay = document.getElementById('createForm')
	event.preventDefault()
	const formData = new FormData(createDisplay)
	const newTask = transformFormData(formData)
	console.log('New Task Data: ', newTask)

	checkNPushNewTask(newTask)

	createForm.reset()
}

export const displayElem = number => {
	const elems = [
		document.getElementById('blur'),
		document.getElementById('createForm'),
	]
	const validElems = elems.filter(elem => elem !== null)
	if (validElems.length === 0) return
	switch (number) {
		case 1:
			validElems.forEach(elem => {
				elem.style.display = 'block'
				elem.style.zIndex = '1'
			})
			break
		case -1:
			validElems.forEach(elem => {
				elem.style.display = 'none'
				elem.style.zIndex = '-1'
			})
			break
	}
}

const hideCreateDisplay = event => {
	const createForm = document.getElementById('createForm')
	const createButton = document.getElementById('createButton')

	if (
		createForm &&
		createButton &&
		event.target.closest('form') === null &&
		event.target !== createButton
	) {
		displayElem(-1)
	}
}

export const showCreateDisplay = TASKLIST => {
	const blur = document.getElementById('blur')
	const createForm = document.getElementById('createForm')
	const escapeButton = document.getElementById('escape-button')
	const deadLineTime = document.getElementById('deadline-time')
	const deadLineDate = document.getElementById('deadline-date')
	const endDateTime = document.getElementById('end-time')
	const endDateDate = document.getElementById('end-date')
	const form = document.getElementById('createForm')

	if (!blur || !createForm || !escapeButton || !form) {
		console.error('Не удалось найти необходимые элементы DOM')
		return
	}
	displayElem(1)
	document.body.addEventListener('click', hideCreateDisplay)
	escapeButton.addEventListener('click', () => {
		displayElem(-1)
	})
	const autofill = (targetInput, sourceInput) => {
		if (targetInput && sourceInput) {
			targetInput.value = sourceInput.value
		}
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

	form.addEventListener('submit', event => submitCreate(event, TASKLIST))
}
