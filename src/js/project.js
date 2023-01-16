
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
            projectLogo: '../img/头像.jpg',
            sort: ''
        },
        card: [],
        addFromData: {
            title: '',
            sort: '',
            data: [
                {
                    name: '',
                    value: '',
                    sort:''
                }
            ]
        }

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
                projectLogo: row.projectLogo || '../img/头像.jpg'
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
            })
            this.card.push(card)
            this.$nextTick(() => {
                this.changeCardColor();
                this.putPicture();
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
    },
    methods: {
        //保存添加窗口
        async savaAdd() {
            //数据检查
            if (!this.addFormDataValid()) return;
            //保存卡片
            var cardId=Date.now();
            var csql = `INSERT INTO 
            card ( "id", "projectId", "title", "sort" )
            VALUES( '${cardId}', '${storage.getItem('projectId')}', '${this.addFromData.title}', '${this.addFromData.sort}' );`;
            console.log(csql)
            await dbEx.insert(csql);
            this.addFromData.data.forEach(async data => {
                var dsql = `INSERT INTO 
                data ( "id", "cardId", "name", "value","type","sort" )
                VALUES( '${Date.now()+Math.ceil(Math.random()*100)}', '${cardId}', '${data.name}', '${data.value}','text','${data.sort}' );`;
                console.log(dsql)
                await dbEx.insert(dsql);
            });
            //新增的默认放第一个
            this.card.unshift(this.addFromData)
            this.$nextTick(() => {
                this.changeCardColor();
                this.putPicture();
            })
            this.pop('保存成功！')
            this.closeAddForm()
        },
        addFormDataValid() {
            //检查数据
            if (this.addFromData.title.trim().length == 0) {
                this.pop("标题没填哦")
                return false;
            }
            if (this.addFromData.sort.trim().length == 0) {
                this.pop("排序号没填哦")
                return false;
            }
            if (this.addFromData.data[0].name.trim().length == 0) {
                this.pop("数据不能为空哦")
                return false;
            }
            return true;
        },
        //关闭添加窗口
        closeAddForm() {
            $('.shadowMock').fadeOut(300);
            $('.addCardForm').fadeOut(300);
            //重置
            setTimeout(() => {
                this.addFromData = {
                    title: '',
                    sort: '',
                    data: [
                        {
                            name: '',
                            value: '',
                            sort:''
                        }
                    ]
                }
            }, 1000)

        },
        // 添加行
        addLine() {
            //最多10行
            if (this.addFromData.data.length >= 10) {
                this.pop("太多了~装不下啦!")
                return;
            }
            var line = {
                name: '',
                value: ''
            }
            this.addFromData.data.push(line);
            $('.addCardForm')
                .css('top', $('.addCardForm')
                    .css('top').substring(0, $('.addCardForm')
                        .css('top').indexOf("px")) - 20 + 'px')
        },
        // 删除行
        delLine(index) {
            this.addFromData.data.splice(index, 1);
            $('.addCardForm')
                .css('top', parseInt($('.addCardForm')
                    .css('top').substring(0, $('.addCardForm')
                        .css('top').indexOf("px"))) + 20 + 'px')
        },
        openAddForm() {

            $('.shadowMock').fadeIn(400);
            $('.addCardForm').fadeIn(300);
            $('.addCardForm').css({
                'background': getRandomCardColor('135deg', '0.95'),
            });
        },
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
            var box = $('.projectCards > .card');
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
            this.pop('已经复制到剪切板')
        },
        pop(text) {
            //提示弹窗
            $('.popText').text(text);
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
                }, 1500)
            }
        }
    }

})