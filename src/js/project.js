
const { ipcRenderer } = require('electron')
const { port1, port2 } = new MessageChannel()
var $ = require('jquery')

var cardColors = [
    'linear-gradient(135deg,rgba(252,227,138,0.5),rgba(243,129,129,0.5))',
    "linear-gradient(135deg,rgba(245,78,162,0.5),rgba(255,118,118,0.5))",
    "linear-gradient(135deg,rgba(23,234,217,0.5),rgba(96,120,234,0.5))",
    "linear-gradient(135deg,rgba(98,39,116,0.5),rgba(197,51,100,0.5))",
    "linear-gradient(135deg,rgba(113,23,234,0.5),rgba(234,96,96,0.5))",
    "linear-gradient(135deg,rgba(66,230,149,0.5),rgba(59,178,184,0.5))",
    "linear-gradient(135deg,rgba(240,47,194,0.5),rgba(96,148,234,0.5))",
    "linear-gradient(135deg,rgba(101,121,155,0.5),rgba(94,37,99,0.5))",
    "linear-gradient(135deg,rgba(24,78,104,0.5),rgba(87,202,133,0.5))",
    "linear-gradient(135deg,rgba(91,36,122,0.5),rgba(27,206,223,0.5))",
    "linear-gradient(135deg,rgba(253,235,113,0.5),rgba(248,216,0,0.5))",
    "linear-gradient(135deg,rgba(171,220,255,0.5),rgba(3,150,255,0.5))"
]

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
                var back = Math.floor(Math.random() * (cardColors.length - 1 - 0 + 1) + 0);
                if (index < num) {
                    //第一行作为基准
                    boxArr[index] = $(this).height();
                    $(value).css({
                        'background': cardColors[back]
                    });
                } else {
                    //定位
                    var minBoxHeight = Math.min.apply(this, boxArr);
                    var minIndex = $.inArray(minBoxHeight, boxArr);
                    $(value).css({
                        'position': 'absolute',
                        'top': minBoxHeight + 35,
                        'left': box.eq(minIndex).position().left,
                        'background': cardColors[back]
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
        }
    },
    mounted() {
        window.mainPage = this;
        this.putPicture();
    }

})