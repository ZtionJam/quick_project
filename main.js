const { Menu, app, BrowserWindow } = require('electron')
Menu.setApplicationMenu(null)
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
})