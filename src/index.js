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
