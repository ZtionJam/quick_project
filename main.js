const { Menu, app, BrowserWindow, ipcRenderer, ipcMain } = require('electron')
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
    // 推出
    ipcMain.on('closeApp', () => {
        // win.hide()
        app.quit()
    })
    // 最小化
    ipcMain.on('minApp', () => {
        win.minimize()
    })
    // 打开项目
    ipcMain.on('openProject', () => {
        win.loadFile('./src/page/project.html')
    })
    // 返回首页
    ipcMain.on('backIndex', () => {
        win.loadFile('./src/index.html')
    })


    var path = app.getAppPath();
    console.log("启动目录：" + path)


    //打开开发工具
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow()
})