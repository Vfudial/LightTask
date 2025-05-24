const { app, BrowserWindow, dialog } = require('electron')
const fs = require('fs')
const path = require('node:path')

if (require('electron-squirrel-startup')) {
	app.quit()
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false,
		},
	})

	mainWindow.loadFile(path.join(__dirname, 'main-menu/index.html'))

	mainWindow.webContents.openDevTools()

	ipcMain.handle('open-file', async () => {
		return openFile()
	})

	ipcMain.handle('save-file', async (event, data) => {
		// Принимаем данные
		return saveFile(data)
	})
}

app.whenReady().then(() => {
	createWindow()
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

async function openFile() {
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ['openFile'],
		filters: [{ name: 'All Files', extensions: ['json'] }],
	})

	if (!canceled && filePaths.length > 0) {
		const filePath = filePaths[0]
		fs.readFile(filePath, 'utf8', (err, data) => {
			if (err) {
				console.error('Ошибка при чтении файла:', err)
				dialog.showErrorBox(
					'Ошибка',
					`Не удалось прочитать файл: ${err.message}`
				)
				return
			}
			//  Обработка содержимого файла (data)
			//  Например, отображение данных в приложении
			console.log('Содержимое файла:', data)
			//  Тут ты можешь обработать `data` (например, обновить `TASKLIST`)
		})
	}
}

async function saveFile(data) {
	// Принимаем данные для записи в файл
	const { canceled, filePath } = await dialog.showSaveDialog({
		title: 'Сохранить файл',
		defaultPath: 'export.txt', //  Имя файла по умолчанию
		filters: [
			{ name: 'Text Files', extensions: ['txt'] }, //  Пример фильтра
			{ name: 'All Files', extensions: ['*'] },
		],
	})

	if (!canceled && filePath) {
		fs.writeFile(filePath, data, 'utf8', err => {
			if (err) {
				console.error('Ошибка при записи в файл:', err)
				dialog.showErrorBox(
					'Ошибка',
					`Не удалось записать файл: ${err.message}`
				) //  Показываем сообщение об ошибке
				return
			}
			console.log('Файл успешно сохранен:', filePath)
			//  Можно показать сообщение об успехе пользователю
		})
	}
}
