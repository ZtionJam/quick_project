
const { ipcRenderer } = require('electron');
const { port1, port2 } = new MessageChannel();
var $ = require('jquery');
const storage = require('electron-localstorage');
const path = require('path')
const { db, dbEx } = require(path.join(__dirname + "/../sqlite/", 'sqlite'));

var app = new Vue({
    el: '#box',
    components: {

    },
    data: {
        title: '加载中',
        project: {
            id: '1',
            projectName: '加载中',
            projectTime: '2022-12-31',
            projectLogo: '',
            sort: ''
        },
        card: []
    },
    async created() {
        var id = storage.getItem('projectId');
        if (!id) {
            alert("参数不正确！！")
            this.backIndex()
        }
        //加载项目信息
        var psql = `select * from project where id =${id}  order by sort desc`;
        await dbEx.each(psql, (row) => {
            var projectData = {
                id: row.id,
                projectName: row.projectName,
                projectTime: row.projectTime,
                projectLogo: row.projectLogo
            }
            this.project = projectData;
            this.title = row.projectName
        })
        //加载卡片
        var csql = `select * from card where projectId =${id}  order by sort desc`;
        await dbEx.each(csql, async (row) => {
            var card = {
                title: row.title,
                data: []
            };
            //加载卡片的数据
            var dsql = `select * from data where cardId =${row.id}  order by sort desc`;
            await dbEx.each(dsql, (ret) => {
                var data = {
                    name: ret.name,
                    value: ret.value
                };
                card.data.push(data)
                console.log(data)
            })
            this.card.push(card)
            this.$nextTick(() => {
                this.changeCardColor();
            })
        })

    },
    mounted() {
        //瀑布流布局
        window.mainPage = this;
        this.putPicture();
        //刷新一次颜色
        this.changeCardColor();
        $('.toolbar').each((index, toolbar) => {
            $(toolbar).css({
                'background': getRandomCardColor('135deg', '0.3'),
                'transition': 'all 500ms'
            });
        })
        //头像
        if (this.project.projectLogo!=null) {
            $(".projectLogo").css({
                'background': 'url("' + this.project.projectLogo + '")',
                'background-size': 'cover'
            });
        }

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
            // 卡片颜色
            $('.card').each((index, card) => {
                $(card).css({
                    'background': getRandomCardColor('135deg', '0.5'),
                    'transition': 'all 500ms'
                });
            });
            //工具栏颜色
            $('.toolbar').each((index, toolbar) => {
                $(toolbar).css({
                    'background': getRandomCardColor('135deg', '0.3'),
                    'transition': 'all 500ms'
                });
            })

        },
        copyCard(item) {
            console.log(item);
            var cardText = item.title + "\n";
            item.data.forEach(d => {
                cardText += d.name + ": " + d.value + "\n";
            });
            this.copyStr(cardText)
        }
        ,
        copyStr(text) {
            //复制到剪切板
            const newInput = document.createElement('textarea');
            document.body.appendChild(newInput);
            newInput.value = text;
            newInput.select();
            document.execCommand('copy');
            document.body.removeChild(newInput);
            //提示弹窗
            console.log($('.pop').css('bottom'))
            if ($('.pop').css('bottom') == '2%' || $('.pop').css('bottom') == '12px') {
                $('.pop').css({
                    'background': getRandomCardColor('135deg', '0.9'),
                    'transition': 'all 500ms',
                    'display': 'block'
                });
                //1s后自动回去
                $('.pop').animate({ bottom: '8%', opacity: '1' });
                setTimeout(function () {
                    $('.pop').animate({ bottom: '2%', opacity: '0' });
                }, 1000)
            }
        }
    }

})