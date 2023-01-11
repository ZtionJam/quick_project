const { Menu, app, BrowserWindow, ipcRenderer, ipcMain } = require('electron')
// Menu.setApplicationMenu(null)
require("@electron/remote/main").initialize();
const sqlite3 = require("sqlite3").verbose();
//dbPath为你想存放数据库文件的目录路径
const db = new sqlite3.Database('./data', (err) => {
    if (err) throw err;
    console.log('sqlite链接成功')
})

var sqlStr = "select * from config where key = 'version' ";
db.serialize(() => {
    var ret = db.each(sqlStr, function (err, row) {
        console.log(row.key + ": " + row.value);
    });
})

//自定义数据库路径
// const userDbPath = path.join(__dirname, "data");

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