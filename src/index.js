const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')

if (require('electron-squirrel-startup')) {
	app.quit()
}

const filePath = path.join(app.getPath('userData'), 'tasklist.json')

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 720,
		minWidth: 800,
		minHeight: 720,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
		},
	})
	mainWindow.loadFile(path.join(__dirname, 'main-menu/index.html'))
}

async function loadTaskList() {
	try {
		const data = await fs.promises.readFile(filePath, 'utf-8')
		return JSON.parse(data)
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log('Файл tasklist.json не найден. Создаю пустой файл.')
			await fs.promises.writeFile(filePath, JSON.stringify([]))
			return []
		} else {
			console.error('Ошибка загрузки списка задач:', error)
			return []
		}
	}
}

async function saveTaskList(taskList) {
	try {
		await fs.promises.writeFile(filePath, JSON.stringify(taskList))
		console.log('Task list saved successfully')
		return true
	} catch (error) {
		console.error('Failed to save task list:', error)
		return false
	}
}

// Функция открытия файла
async function openFile(browserWindow) {
	const options = {
		properties: ['openFile'],
		filters: [{ name: 'JSON Files', extensions: ['json'] }],
	}

	const result = await dialog.showOpenDialog(browserWindow, options)
	if (!result.canceled) {
		const filePath = result.filePaths[0]
		try {
			const data = await fs.promises.readFile(filePath, 'utf-8')
			const loadedTasks = JSON.parse(data)
			if (!Array.isArray(loadedTasks)) {
				throw new Error('Неверный формат файла: ожидался массив.')
			}
			return loadedTasks
		} catch (error) {
			console.error('Ошибка при открытии файла:', error)
			dialog.showErrorBox('Ошибка при открытии файла', error.message)
			return null
		}
	}
	return null
}

async function saveFile(browserWindow, data) {
	try {
		const result = await dialog.showSaveDialog(browserWindow, {
			defaultPath: 'untitled.json',
		})

		if (result.canceled) {
			return { canceled: true }
		}

		const filePath = result.filePath

		try {
			await fs.promises.writeFile(filePath, data)
			return { filePath: filePath }
		} catch (writeError) {
			console.error('Ошибка при записи файла:', writeError)
			return { error: 'Ошибка при записи файла', details: writeError }
		}
	} catch (error) {
		console.error('Ошибка при открытии диалога сохранения:', error)
		alert('Ошибка записи на файл! Пожалуйста, попробуйте снова.')
		return { error: 'Ошибка при сохранении файла', details: error }
	}
}

app.whenReady().then(() => {
	createWindow()

	ipcMain.handle('load-task-list', async () => {
		return loadTaskList()
	})

	ipcMain.handle('save-task-list', async (event, taskList) => {
		return saveTaskList(taskList)
	})

	ipcMain.handle('open-file', async () => {
		const browserWindow = BrowserWindow.getFocusedWindow()
		return openFile(browserWindow)
	})

	ipcMain.handle('save-file', async (event, data) => {
		const browserWindow = BrowserWindow.getFocusedWindow()
		return saveFile(browserWindow, data)
	})

	ipcMain.handle('show-error', (event, message) => {
		dialog.showErrorBox('Ошибка', message)
	})

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
