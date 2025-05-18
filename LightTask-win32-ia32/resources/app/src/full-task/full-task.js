export const FULLTASK = (task, index) => `
  <div id="fulltask-block" data-index="${index}">
    <div class="fulltask-inside-container">
      <div class="fulltask-head">
        <h3>${task[0]}</h3>
      </div>
      <div class="fulltask-body">
        <p>${task[1]}</p>
      </div>
      <div class="fulltask-footer">
        <div class="deadline">Дедлайн: ${task[2]}</div>
        ${
					task[3]
						? '<div class="urgency high">Срочно</div>'
						: '<div class="urgency low">Не срочно</div>'
				}
        ${
					task[4]
						? '<div class="importance high">Важно</div>'
						: '<div class="importance low">Не важно</div>'
				}
        <div class="category"><span>Категория:</span><br><p>${task[5]}</p></div>
				<div id="button-delete" data-index="${index}" data-type="remove"><img src="../../img/delete.png" alt="Удалить" srcset="" data-index="${index}" data-type="remove"></div>
      </div>
    </div>
  </div>
  `
