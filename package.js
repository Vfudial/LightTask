var installer = require('electron-winstaller')
var path = require('path')
const dialog = require('electron').dialog

console.log('packaging into a exe...\n')
resultPromise = installer.createWindowsInstaller({
	appDirectory: './LightTask-win32-ia32',
	outputDirectory: './installers/final',
	exe: 'LightTaskInstaller.exe',
	setupExe: 'LightTaskInstall.exe',
	noMsi: true,
	iconUrl: 'IconUrl',
	setupIcon: 'IconPath',
})

resultPromise.then(function () {
	console.log('Installer created')
	dialog.showMessageBox({
		type: 'info',
		title: 'electron-winstaller',
		message: 'Installer created',
		buttons: ['ok'],
	})
	require('electron').app.quit()
})
