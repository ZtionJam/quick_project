const { dialog, Menu, app, BrowserWindow, ipcRenderer, ipcMain } = require('electron')
// Menu.setApplicationMenu(null)
require("@electron/remote/main").initialize();
const fs = require('fs')
const ChildProccess = require('child_process');
const https = require('https');
const path = require('path')


var runPath = process.cwd().toString();
var logPath = runPath + "/log/run.log";
var updateNow = false;

//日志文件
if (!fs.existsSync(runPath + "/log/run.log")) {
    fs.mkdirSync(runPath + "/log/", (err) => { });
    fs.writeFileSync(runPath + "/log/run.log", "QuickPriject\n", (err) => {
    });
    log('创建日志文件');
}
//检查数据库文件
if (!fs.existsSync(runPath + "/data/")) {
    fs.mkdirSync(runPath + "/data/", (err) => {
        if (err) {
            log("创建数据库文件失败！！！", err.message)
        }
    });
    // fs.copyFileSync('./data/data', runPath + "/data/data"); 
    log('创建数据文件');
}

const createWindow = async () => {
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
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
            if (win) {
                if (win.isMinimized()) win.restore()
                win.focus()
                win.show()
            }
        })
    }
    // require("@electron/remote/main").enable(win.webContents);

    win.loadFile('./src/index.html')

    win.once('ready-to-show', () => {
        // 初始化后再显示
        win.show()
        //打开开发工具
        // win.webContents.openDevTools();
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
        win.loadFile('./src/page/card.html')
    })
    // 返回首页
    ipcMain.on('backIndex', () => {
        win.loadFile('./src/index.html')
    })
    //打开文件选择
    ipcMain.on('open-openDirectory-dialog', function (event, p) {
        var choose = dialog.showOpenDialogSync({
            properties: [p],
            title: '选择导出的Excel文件保存目录',
            // defaultPath:''
        })
        if (choose) {
            event.sender.send("chooseDir", choose[0])
        }

    });
    // 更新Asar
    ipcMain.on('updateAsar', () => {
        updateNow = true;
        app.quit();
    });
    // 下载Asar
    ipcMain.on('downAsar', (event, data) => {
        download(data.uri, data.filename, win);
    });


    var path = app.getAppPath();
    console.log("启动目录：" + path)

    log("启动完成")


}

app.whenReady().then(() => {
    createWindow()
})
app.on('quit', () => {
    if (updateNow) {
        var child = ChildProccess.spawn(`"${runPath + '/update.exe'}"`, [`"${runPath + '/resources'}"`, `"${runPath + '/QuickProject.exe'}"`], {
            detached: true,
            shell: true,
            stdio: 'ignore'
        })
        child.unref()
    }
})

function log(str) {

    fs.appendFile(logPath, `-----${getCurrentTime()}---` + str + "\n", "utf8", (err) => { });
}

function getCurrentTime() {
    var date = new Date();//当前时间
    var year = date.getFullYear() //返回指定日期的年份
    var month = date.getMonth() + 1;//月
    var day = date.getDate();//日
    var hour = (date.getHours());//时
    var minute = (date.getMinutes());//分
    var second = (date.getSeconds());//秒

    //当前时间 
    var curTime = year + "-" + month + "-" + day
        + " " + hour + ":" + minute + ":" + second;
    return curTime;
}
function download(uri, filename, win) {
    var onError = (e) => {
        console.log(e)
        console.log('err')
        win.webContents.send("downErr", e)
    }
    https.get(uri, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
            var fileStream = fs.createWriteStream(filename);
            fileStream.on('error', onError);
            console.log(response.headers)
            response.pipe(fileStream);
            var len = 0;
            response.on('data', function (chunk) {
                len += chunk.length;
                win.webContents.send("chunk", { size: 841596, len: len });
            });
            fileStream.on('finish', function (data) {
                console.log('下载完成！')
                win.webContents.send("downOver", "downOver")
            });
        } else if (response.headers.location) {
            download(response.headers.location, filename, win);
        } else {
            new Error(response.statusCode + ' ' + response.statusMessage);
        }
    }).on('error', onError);
}