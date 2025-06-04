const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
	loadTaskList: () => ipcRenderer.invoke('load-task-list'),
	saveTaskList: taskList => ipcRenderer.invoke('save-task-list', taskList),
	openFile: () => ipcRenderer.invoke('open-file'),
	saveFile: data => ipcRenderer.invoke('save-file', data),
	showError: message => ipcRenderer.send('show-error', message),
})
