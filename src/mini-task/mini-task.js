export const TASKPATTERN = (task, index) => `
    <div class="task-container" data-index="${index}" data-selected="${task[6]}">
        <div class="task-head">${escapeHtml(task[0])}</div>
        <div class="task-body"><p>${escapeHtml(task[1])}</p></div>
        <div class="task-footer">
            <div class="deadline">${task[2]}</div>
            <div class="urgency ${task[3] ? 'high' : 'low'}">${task[3] ? 'Срочно' : 'Не срочно'}</div>
            <div class="importance ${task[4] ? 'high' : 'low'}">${task[4] ? 'Важно' : 'Не важно'}</div>
            <div class="category"><p>${escapeHtml(task[5])}</p></div>
            <button id="button-delete" data-type="remove" data-index="${index}">
                <img src="../../img/delete.png" alt="Delete">
            </button>
        </div>
        ${task[6] ? '<div class="task-blur"></div>' : ''}
    </div>
`;

export const blurTask = (enable, element) => {
    if (element) {
        element.style.display = enable ? 'block' : 'none';
    }
};

export function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}