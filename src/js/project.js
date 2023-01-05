
const { ipcRenderer } = require('electron')
const { port1, port2 } = new MessageChannel()
var app = new Vue({
    el: '#box',
    data: {
        title: '测试项目'
    },
    mounted() {
    },
    methods: {
        backIndex() {
            ipcRenderer.send("backIndex", "backIndex")
        },
        close() {
            ipcRenderer.send("closeApp", "closeApp")
        },
        minimize() {
            ipcRenderer.send("minApp", "minApp")
        }

    }

})