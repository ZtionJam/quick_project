
const { ipcRenderer } = require('electron')
const { port1, port2 } = new MessageChannel()
var $ = require('jquery')

var app = new Vue({
    el: '#box',
    components: {

    },
    data: {
        title: '测试项目',
        project: {
            id: '1',
            projectName: '阿里巴巴开发项目',
            projectTime: '2022-12-31'
        },
        card: [
            {
                title: "测试数据库",
                data: [
                    {
                        name: "数据库地址",
                        value: "192.168.2.2"
                    },
                    {
                        name: "账号",
                        value: "Tencent"
                    },
                    {
                        name: "密码",
                        value: "root"
                    }

                ]
            },
            {
                title: "Nacos",
                data: [
                    {
                        name: "地址",
                        value: "192.168.2.2:8848"
                    },
                    {
                        name: "账号",
                        value: "Nacos"
                    },
                    {
                        name: "密码",
                        value: "root1234"
                    }

                ]
            },
            {
                title: "工作安排",
                data: [
                    {
                        name: "地址",
                        value: "https://v.qq.com/"
                    }

                ]
            },
            {
                title: "墨刀原型图",
                data: [
                    {
                        name: "地址",
                        value: "https://modao.cc/feature/prototype/"
                    }

                ]
            },
            {
                title: "小程序信息",
                data: [
                    {
                        name: "AppID",
                        value: "h32j426h3j5747h2h22"
                    },
                    {
                        name: "AppSecret",
                        value: "12312h1j5j5j35ho2o3p2"
                    }

                ]
            },
            {
                title: "RabbitMQ",
                data: [
                    {
                        name: "地址",
                        value: "https://v.qq.com/"
                    },
                    {
                        name: "账号",
                        value: "admin"
                    },
                    {
                        name: "密码",
                        value: "admin123"
                    }

                ]
            },
            {
                title: "Git地址",
                data: [
                    {
                        name: "后台JAVA",
                        value: "https://v.qq.com/"
                    },
                    {
                        name: "前端",
                        value: "https://v.qq.com/"
                    }

                ]
            },
            {
                title: "蓝湖",
                data: [
                    {
                        name: "地址",
                        value: "https://v.qq.com/"
                    }

                ]
            },
            {
                title: "服务器",
                data: [
                    {
                        name: "IP",
                        value: "192.168.1.1"
                    },
                    {
                        name: "用户名",
                        value: "root"
                    },
                    {
                        name: "密码",
                        value: "root123"
                    }

                ]
            }

        ]

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
        },
        putPicture() {
            //计算每行数量
            var box = $('.card');
            var boxWidth = box.eq(0).width();
            var documentWidth = $(document).width();
            var num = Math.floor(documentWidth / boxWidth);
            var boxArr = [];
            box.each(function (index, value) {
                var boxHeight = box.eq(index).height();
                //背景色
                $(value).css({
                    'background': getRandomCardColor('135deg', '0.5')
                });
                if (index < num) {
                    //第一行作为基准
                    boxArr[index] = $(this).height();
                } else {
                    //定位
                    var minBoxHeight = Math.min.apply(this, boxArr);
                    var minIndex = $.inArray(minBoxHeight, boxArr);
                    $(value).css({
                        'position': 'absolute',
                        'top': minBoxHeight + 35,
                        'left': box.eq(minIndex).position().left,
                    });
                    boxArr[minIndex] += $(this).height() + 35;
                };

            })
        },
        scrollLoad() {
            var box = $('.card');
            var lastBox = box.last().get(0);
            var lastBoxTop = lastBox.offsetTop;
            var nodeBoxHeight = box.last().height() / 1.1;
            var nodeOffsetHeight = nodeBoxHeight + lastBoxTop;
            var documentHeight = $(window).height();
            var scrollHeight = $(window).scrollTop();
            return (nodeOffsetHeight < documentHeight + scrollHeight) ? true : false
        },
        changeCardColor() {
            $('.card').each((index, card) => {
                $(card).css({
                    'background': getRandomCardColor('135deg', '0.5')
                });
            })

        },
        copyCard(event) {
            console.log(event.target)
            this.copyStr('666');
        },
        copyStr(text) {
            const newInput = document.createElement('input');
            document.body.appendChild(newInput);
            newInput.value = text;
            newInput.select();
            document.execCommand('copy');
            document.body.removeChild(newInput);
        }
    },
    mounted() {
        window.mainPage = this;
        this.putPicture();
        this.changeCardColor();

    }

})