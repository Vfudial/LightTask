export const CREATEBLOCK = () =>
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
