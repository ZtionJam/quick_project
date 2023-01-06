
const { ipcRenderer } = require('electron')
const { port1, port2 } = new MessageChannel()
// var Vue = require('vue')
// var Waterfall = require('vue-waterfall')
var app = new Vue({
    el: '#box',
    components: {
        // 'waterfall': Waterfall.waterfall,
        // 'waterfall-slot': Waterfall.waterfallSlot,
        // 'grid-layout': VueGridLayout.GridLayout,
        // 'grid-item': VueGridLayout.GridItem

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
            }

        ]

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
        },
        putPicture() {
            //获取盒子
            var box = $('.projectCards');
            //获取图片的宽度
            var boxWidth = box.eq(0).width();
            // 获取每一行摆放图片的个数
            // 1.获取页面的宽
            var documentWidth = $(document).width();
            // 2. 计算个数
            var num = Math.floor(documentWidth / boxWidth);
            // 定义一个 存放高度的数组
            var boxArr = [];
            // 获取每个盒子的高度
            box.each(function (index, value) {
                // 获取高度
                var boxHeight = box.eq(index).height();
                // 把第一行盒子的高度放进数组中
                if (index < num) {
                    boxArr[index] = $(this).height();
                } else { // 从第二行开始
                    // 获取第一行的最小高度
                    var minBoxHeight = Math.min.apply(this, boxArr);
                    // 获取最小高度在数组内的索引
                    var minIndex = $.inArray(minBoxHeight, boxArr);
                    //设置这张图片的位置
                    $(value).css({
                        'position': 'absolute',
                        'top': minBoxHeight,
                        'left': box.eq(minIndex).position().left
                    });
                    // 重新计算最小盒子高度
                    boxArr[minIndex] += $(this).height();
                };

            })
        },
        scrollLoad() {
            // 获取盒子对象
            var box = $('.box');
            // 获取最后一个盒子
            var lastBox = box.last().get(0);
            // 节点位置： 最后一张图片完全看见
            // 获取节点图片距离顶部的距离
            var lastBoxTop = lastBox.offsetTop;
            // 获取节点位置距离节点图片上边框的高度
            var nodeBoxHeight = box.last().height() / 1.1;
            //获取节点位置距离顶部的高度
            var nodeOffsetHeight = nodeBoxHeight + lastBoxTop;

            // 获取页面窗口的高度
            var documentHeight = $(window).height();
            // 获取混动条滚动的距离
            var scrollHeight = $(window).scrollTop();
            //当  加载节点的位置距离页面顶部的距离  <  页面可视窗口的高度 + 鼠标滚动的距离  时返回true允许加载，否则，返回false，不允许加载
            return (nodeOffsetHeight < documentHeight + scrollHeight) ? true : false
        }
    }

})