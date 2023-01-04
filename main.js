const { Menu, app, BrowserWindow } = require('electron')
Menu.setApplicationMenu(null)
require("@electron/remote/main").initialize();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        backgroundColor: '#00000000',
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    require("@electron/remote/main").enable(win.webContents);

    win.loadFile('./src/index.html')

    win.once('ready-to-show', () => {
        // 初始化后再显示
        win.show()
    })
    //打开开发工具
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow()
})