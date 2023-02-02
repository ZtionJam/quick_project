
const { ipcRenderer } = require('electron');
var $ = require('jquery');
// const storage = require('electron-localstorage');
const path = require('path')
const { db, dbEx, storage } = require(path.join(__dirname + "/../sqlite/", 'sqlite'));
const XLSX = require("xlsx");
const XLSX2 = require("xlsx-style");
const fs = require('fs')

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
            id: '',
            title: '',
            sort: '',
            data: [
                {
                    name: '',
                    value: '',
                    sort: ''
                }
            ]
        },
        confirmForm: {
            title: 'Are you sure?',
            content: '真的要删除 测试 这个卡片吗？删除后将无法恢复哦！',
            index: 0
        },
        updateData: {
            size: 0,
            uri: '',
            sizeMB: '0',
            nowMB: '0'
        },
        updateBar: false

    },
    async created() {
        var id = await storage.getItem('projectId');
        console.log('项目id' + id)
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
            if (projectData.projectLogo.indexOf('/img/') > 0) {
                projectData.projectLogo = '../img/头像.jpg'
            }
            this.project = projectData;
            this.title = row.projectName
        })
        //加载卡片
        var csql = `select * from card where projectId =${id}  order by sort desc`;
        await dbEx.each(csql, async (row) => {
            var card = {
                id: row.id,
                title: row.title,
                sort: row.sort,
                data: []
            };
            //加载卡片的数据
            var dsql = `select * from data where cardId =${row.id}  order by sort desc`;
            await dbEx.each(dsql, (ret) => {
                var data = {
                    id: ret.id,
                    name: ret.name,
                    value: ret.value,
                    sort: ret.sort
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
        //监听下载信息
        ipcRenderer.on("downOver", () => {
            $('.updateBar').css({
                'transition': 'all 500ms',
                'display': 'none'
            });
            $('.updateBar').animate({ bottom: '5%', opacity: '1' });
            this.pop("下载完成")
        });
        ipcRenderer.on("downErr", (e, err) => {
            $('.updateBar').css({
                'transition': 'all 500ms',
                'display': 'none'
            });
            console.log(err)
            this.pop("下载出错了,请稍后重试", 250, 5000)
        });
        ipcRenderer.on("chunk", async (e, chunk) => {
            if (!this.updateBar) {
                $('.updateBar').css({
                    'transition': 'all 500ms',
                    'display': 'block'
                });
                $('.updateBar').animate({ bottom: '5%', opacity: '1' });
                this.updateBar = true;
            }
            this.updateData.sizeMB = (chunk.size / 1024 / 1024).toFixed(2)
            this.updateData.nowMB = (chunk.len / 1024 / 1024).toFixed(2)
            $('#baring').css('width', (this.updateData.nowMB / this.updateData.sizeMB).toFixed(2) * 100 + '%')
        });
    },
    methods: {
        //调起进度条
        openBar() {
            $('.updateBar').css({
                // 'background': getRandomCardColor('135deg', '0.9'),
                'transition': 'all 500ms',
                'display': 'block'
            });
            $('.updateBar').animate({ bottom: '5%', opacity: '1' });

            this.updateInterval = setInterval(async () => {
                this.updateData.sizeMB = (await storage.getItem('downSize') / 1024 / 1024).toFixed(2)
                this.updateData.nowMB = (await storage.getItem('downNow') / 1024 / 1024).toFixed(2)
                $('#baring').css('width', (this.updateData.nowMB / this.updateData.sizeMB).toFixed(2) * 100 + '%')

            }, 1000)
        },
        //全局编辑
        globalEdit() {
            this.pop('全局编辑开发中！')
        },
        //打开项目文件夹
        openProjectDir() {
            this.pop('文件夹功能开发中！')
        },
        //打开帮助
        openHelp() {
            this.pop('帮助功能开发中！')
        },
        //导出为excel
        exportExcel() {
            var outputFile = process.cwd().toString() + "/data/output.xlsx"
            //选择下载目录
            ipcRenderer.send('open-openDirectory-dialog', 'openDirectory');
            ipcRenderer.on('chooseDir', (e, path) => {
                if (!fs.existsSync(path)) {
                    this.pop('所选文件夹不存在!')
                    return;
                }
                outputFile = `${path}/${this.project.projectName}.xlsx`;
                //初始化表格
                var ws = XLSX.utils.aoa_to_sheet([['A1']]);
                var workbook = {
                    SheetNames: ['sheet1'],
                    Sheets: {
                        'sheet1': ws
                    }
                };
                var worksheet = workbook.Sheets[workbook.SheetNames[0]];
                worksheet['!ref'] = `A1:AI${this.card.length * 10}`;
                //设置列宽
                worksheet['!cols'] = [{ wch: 23 }, { wch: 30 }];
                //标题
                worksheet['A1'] = {
                    v: this.project.projectName,
                    s: {
                        alignment: {
                            vertical: 'center',
                            horizontal: 'center'
                        }
                    }
                }

                //合并标题框
                var merge = [
                    { s: { r: 0, c: 0 }, e: { r: 1, c: 1 } }
                ]
                worksheet['!merges'] = merge
                //数据
                // worksheet['A3'] = { v: '名称' };
                // worksheet['B3'] = { v: '值' }
                var row = 2;
                this.card.forEach(card => {
                    row += 1;
                    worksheet['A' + row] = {
                        v: card.title,
                        s: {
                            fill: { patternType: 'solid', fgColor: { rgb: '92D050' } }
                        }
                    }
                    worksheet['B' + row] = {
                        v: '',
                        s: {
                            fill: { patternType: 'solid', fgColor: { rgb: '92D050' } }
                        }
                    }
                    card.data.forEach(data => {
                        row += 1;
                        worksheet['A' + row] = { v: data.name }
                        worksheet['B' + row] = { v: data.value }
                    })
                    row += 1;
                })
                XLSX2.writeFile(workbook, outputFile);
                this.pop('导出成功')
            })
        },
        //确认删除
        async confirmDel() {
            var index = this.confirmForm.index;
            var card = this.card[index];
            if (!card) {
                this.pop('数据未找到！！！')
                return;
            }
            //删除卡片
            var csql = `delete from card where id =${card.id}`;
            var dsql = `delete from data where cardId=${card.id}`;
            await dbEx.update(csql);
            await dbEx.update(dsql);
            this.card.splice(index, 1)
            this.$nextTick(() => {
                this.putPicture();
            })
            this.closeDelForm()
            this.pop('删除完成')
        },
        //关闭删除狂
        closeDelForm() {
            $('.shadowMock').fadeOut(400);
            $('.confirmForm').fadeOut(300);
        },
        //显示删除框
        delCard(item, index) {
            //数据填充
            this.confirmForm = {
                title: 'Are you sure?',
                content: `真的要删除 ${item.title} 这个卡片吗？删除后将无法恢复哦！`,
                index: index
            }

            $('.shadowMock').fadeIn(400);
            $('.confirmForm').fadeIn(300);
            $('.confirmForm').css({
                'background': getRandomCardColor('135deg', '0.95'),
            });
        },
        //保存修改
        async saveUpdate() {
            //数据检查
            if (!this.addFormDataValid()) return;
            console.log(this.addFromData)
            if (this.addFromData.id.trim().length < 1) {
                this.pop('卡片信息残缺，请重启应用！')
                return;
            }
            //先保存卡片信息
            var csql = `UPDATE "card" 
                SET "projectId" = '${this.project.id}',
                "title" = '${this.addFromData.title}',
                "sort" = ${this.addFromData.sort} 
                WHERE
                "id" = '${this.addFromData.id}';`;
            // console.log(csql);
            await dbEx.update(csql);
            //清除所有行
            var ddsql = `delete from data where cardId='${this.addFromData.id}'`;
            // console.log(ddsql)
            await dbEx.update(ddsql);
            //插入所有行
            this.addFromData.data.forEach(async data => {
                var dataId = Date.now() + Math.ceil(Math.random() * 100);
                var dsql = `INSERT INTO 
                data ( "id", "cardId", "name", "value","type","sort" )
                VALUES( '${dataId}', '${this.addFromData.id}', '${data.name}', '${data.value}','text','${data.sort || 0}' );`;
                data.id = dataId;
                // console.log(dsql)
                await dbEx.insert(dsql);
            });
            var index = await storage.getItem('updateIndex') || 0;
            this.card[index] = JSON.parse(JSON.stringify(this.addFromData))
            this.$forceUpdate()
            this.$nextTick(() => {
                this.putPicture();
            })
            //关闭
            this.closeAddForm();
        },
        //修改卡片信息
        async editCard(card, inedx) {
            storage.setItem("opt", 'update');
            storage.setItem("updateIndex", inedx);
            // console.log(card)
            //打开编辑窗口
            this.addFromData = JSON.parse(JSON.stringify(card))
            $('.shadowMock').fadeIn(400);
            $('.addCardForm').fadeIn(300);
            $('.addCardForm').css({
                'background': getRandomCardColor('135deg', '0.95'),
            });
        },
        //保存添加窗口
        async savaAdd() {
            if ('update' == await storage.getItem("opt")) {
                this.saveUpdate()
                return;
            }
            //数据检查
            if (!this.addFormDataValid()) return;
            //保存卡片
            var cardId = Date.now();
            this.addFromData.id = cardId;
            var csql = `INSERT INTO 
            card ( "id", "projectId", "title", "sort" )
            VALUES( '${cardId}', '${this.project.id}', '${this.addFromData.title}', '${this.addFromData.sort}' );`;
            console.log(csql)
            await dbEx.insert(csql);
            this.addFromData.data.forEach(async data => {
                var dsql = `INSERT INTO 
                data ( "id", "cardId", "name", "value","type","sort" )
                VALUES( '${Date.now() + Math.ceil(Math.random() * 100)}', '${cardId}', '${data.name}', '${data.value}','text','${data.sort}' );`;
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
            // if (this.addFromData.sort.trim().length == 0) {
            //     this.pop("排序号没填哦")
            //     return false;
            // }
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
            //重置数据
            setTimeout(() => {
                this.addFromData = {
                    title: '',
                    sort: '',
                    data: [
                        {
                            name: '',
                            value: '',
                            sort: ''
                        }
                    ]
                }
            }, 300)
            //重置添加窗口的位置
            $('.addCardForm').css({
                left: '30%',
                top: '20%'
            });

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
                        .css('top').indexOf("px")) - 10 + 'px');
            // this.putPicture();
        },
        // 删除行
        delLine(index) {
            this.addFromData.data.splice(index, 1);
            $('.addCardForm')
                .css('top', parseInt($('.addCardForm')
                    .css('top').substring(0, $('.addCardForm')
                        .css('top').indexOf("px"))) + 10 + 'px')
        },
        openAddForm() {
            storage.setItem("opt", 'add');
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
        pop(text, width, time) {
            if (!width) {
                width = 160;
            }
            if (!time) {
                time = 2000
            }
            //提示弹窗
            $('.popText').text(text);
            if ($('.pop').css('bottom') == '2%' || $('.pop').css('bottom') == '12px') {
                $('.pop').css({
                    'background': getRandomCardColor('135deg', '0.9'),
                    'transition': 'all 500ms',
                    'display': 'block',
                    'width': width + 'px'
                });
                //1s后自动回去
                $('.pop').animate({ bottom: '8%', opacity: '1' });
                setTimeout(function () {
                    $('.pop').animate({ bottom: '2%', opacity: '0' });
                }, time)
                setTimeout(function () {
                    $('.pop').css('width', '160px')
                }, time + 1000)
            }
        }
    }

})