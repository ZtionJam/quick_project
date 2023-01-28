const { ipcRenderer } = require('electron');
const path = require('path')
const { db, dbEx, newData, storage } = require(path.join(__dirname + "/sqlite/", 'sqlite'))
const https = require('https');
var request = require('request');
const download = require('download');
const fs = require('fs')


var runPath = process.cwd().toString();

var $ = require('jquery');
var app = new Vue({
    el: '#box',
    data: {
        title: '首页',
        addFrom: {
            id: '',
            projectName: '',
            projectTime: '',
            projectLogo: './img/头像.jpg',
            sort: '',
        },
        projects: [],
        confirmUse: 'del',
        confirmForm: {
            title: 'Are you sure?',
            content: '真的要删除 测试 这个卡片吗？删除后将无法恢复哦！',
            index: 0,
            noText: '取消',
            yesText: '确定'
        },
        updateData: {
            size: 0,
            uri: '',
            sizeMB: '',
            nowMB: ''
        },
        updateInterval: 0
    },
    async created() {
        //判断数据库是否是新建的,如果是新建的data文件，则执行建表sql
        if (newData) {
            await dbEx.initTable();
            console.log('初始化建表完成')
            await dbEx.insertDemo();
            console.log('插入demo数据完成')
        }
        //加载数据
        var sql = "select * from project order by sort desc";
        await dbEx.each(sql, (row) => {
            var project = {
                id: row.id,
                projectName: row.projectName,
                projectTime: row.projectTime,
                projectLogo: row.projectLogo,
                sort: row.sort,
            }
            this.projects.push(project)
            this.atvImg()
            this.$nextTick(() => {
                this.atvImg();
            })
        })
        this.projects.sort(function (a, b) {
            return parseInt(b.sort) - parseInt(a.sort)
        })
    },
    async mounted() {
        this.atvImg();
        //检查更新信息
        this.findUpload()
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
        //检查是否有正在下载的进程
        async findUpload() {
            var once = await storage.getItem('downNow');
            if (once > 0) {
                setTimeout(async () => {
                    var tow = await storage.getItem('downNow');
                    if (once != tow) {
                        this.openBar()
                    } else {
                        setTimeout(async () => {
                            var three = await storage.getItem('downNow');
                            if (once != three) {
                                this.openBar()
                            } else {
                                this.checkUpdate()
                            }
                        }, 3000)
                    }
                }, 1000)
            } else {
                this.checkUpdate()
            }

        },
        //取消更新
        cancelUpdate() {
            $('.shadowMock').fadeOut(400);
            $('.confirmForm').fadeOut(300);
        },
        //立即更新
        updateNow() {
            $('.updateBar').css({
                // 'background': getRandomCardColor('135deg', '0.9'),
                'transition': 'all 500ms',
                'display': 'block'
            });
            $('.updateBar').animate({ bottom: '5%', opacity: '1' });
            $('.shadowMock').fadeOut(400);
            $('.confirmForm').fadeOut(300);
            var filename = runPath + '/resources/update.as';
            ipcRenderer.send('downAsar', { uri: this.updateData.uri, filename: filename });
            this.openBar();
            this.pop('请保持软件开启，正常使用!',230,4000)
        },
        //检查更新
        async checkUpdate() {
            //检查asar更新
            try {
                if (await storage.getItem('autoUpdateAsar') == 'true') {
                    var url = await storage.getItem('asarReleasesUrl');
                    var nowVersion = await storage.getItem('versionNum');
                    request(url, { headers: { 'User-Agent': 'request' } }, (error, response, body) => {
                        var data = JSON.parse(body)
                        var lastVersion = JSON.parse(data[0].body).versionNum
                        if (lastVersion > nowVersion) {
                            // this.pop('Github上发布了新版本哦！', 230, 2000)
                            //删除一次，防止上次的下载中断文件
                            var fileUrl = data[0].assets[0].browser_download_url;
                            var fileSize = data[0].assets[0].size;
                            var len = 0;
                            this.updateData.size = fileSize;
                            this.updateData.uri = fileUrl;
                            storage.setItem('downSize', fileSize);
                            //弹出更新提示框
                            this.confirmUse = 'update';
                            this.confirmForm = {
                                title: '有更新哦',
                                content: `检测到有新的版本更新，是否立即更新？(取消更新后今天不再弹窗提示)`,
                                index: 99999,
                                noText: '暂不更新',
                                yesText: '立即更新'
                            }

                            $('.shadowMock').fadeIn(400);
                            $('.confirmForm').fadeIn(300);
                            $('.confirmForm').css({
                                'background': getRandomCardColor('135deg', '0.95'),
                            });
                        }

                    })
                }
            } catch (error) {
                console.log('检查更新失败', error)
            }
        },
        //输入框失去焦点
        async blurSave(project) {
            if (!project) {
                this.pop('数据未找到！！！')
                return;
            }
            var psql = `UPDATE "project" 
                SET "projectName" = '${project.projectName}',
                    "projectTime" = '${project.projectTime}',
                    "projectLogo" = '${project.projectLogo}',
                    "sort" = '${project.sort}' 
                WHERE
                    "id" = '${project.id}';`;
            await dbEx.update(psql);
            this.projects.sort(function (a, b) {
                return parseInt(b.sort) - parseInt(a.sort)
            })
            this.pop('修改保存成功')
        },
        //确认删除
        async confirmDel() {
            if (this.confirmUse == 'update') {
                this.updateNow()
                return;
            }
            var index = this.confirmForm.index;
            var project = this.projects[index]
            if (!project) {
                this.pop('数据未找到！！！')
                return;
            }
            //删除项目
            var psql = `delete from project where id =${project.id}`;
            await dbEx.update(psql);
            this.projects.splice(index, 1)
            this.$nextTick(() => {
                this.atvImg();
            })
            this.closeDelForm()
            this.pop('删除完成')
        },
        //关闭删除狂
        closeDelForm() {
            if (this.confirmUse == 'update') {
                this.cancelUpdate()
                return;
            }
            $('.shadowMock').fadeOut(400);
            $('.confirmForm').fadeOut(300);
        },
        //打开删除框
        delProject(project, index) {
            this.confirmUse = 'update';
            //数据填充
            this.confirmForm = {
                title: 'Are you sure?',
                content: `真的要删除 ${project.projectName} 这个卡片吗？删除后将无法恢复哦！`,
                index: index,
                noText: '取消',
                yesText: '确定'
            }

            $('.shadowMock').fadeIn(400);
            $('.confirmForm').fadeIn(300);
            $('.confirmForm').css({
                'background': getRandomCardColor('135deg', '0.95'),
            });
        },
        //数组排序
        sort(urlList) {
            for (var i = 0; i <= urlList.length - 2; i++) {
                for (var j = i + 1; j <= urlList.length - 1; j++) {
                    if (urlList[j].ind < urlList[i].ind) {
                        var num = urlList[j];
                        urlList[j] = urlList[i]
                        urlList[i] = num
                    }
                }
            }
        },
        async addProject() {
            //参数校验
            if (!this.addFormDataValid()) return;
            var projectId = Date.now();
            this.addFrom.id = projectId;
            var sql = `INSERT INTO 
            project ( "id", "projectName", "projectTime", "projectLogo", "sort" )
            VALUES( '${projectId}', '${this.addFrom.projectName}', '${this.addFrom.projectTime}', '${this.addFrom.projectLogo}', '${this.addFrom.sort}' );`;
            await dbEx.insert(sql);
            //新增默认放到第一个
            this.projects.unshift(this.addFrom);
            //dom更新后渲染新的卡片
            this.$nextTick(() => {
                this.atvImg();
                this.closeAddForm();
                //清楚新增页面的数据
                setTimeout(() => {
                    this.addFrom = {
                        id: '',
                        projectName: '',
                        projectTime: '',
                        projectLogo: './img/头像.jpg',
                        sort: '',
                    };
                    $("#addFormLogo").css({
                        'background': 'url("./img/头像.jpg")',
                        'background-size': 'cover'
                    });
                }, 1000)

            })
        },
        addFormDataValid() {
            //检查数据
            if (this.addFrom.projectName.trim().length == 0) {
                this.pop("标题没填哦")
                return false;
            }
            if (this.addFrom.projectTime.trim().length == 0) {
                this.pop("时间没填哦")
                return false;
            }
            if (this.addFrom.sort.trim().length == 0) {
                this.pop("排序号没填哦")
                return false;
            }
            return true;
        },
        //本地上传图片
        selectImage() {
            var inputObj = document.createElement('input')
            inputObj.setAttribute('id', 'my_inputObj');
            inputObj.setAttribute('type', 'file');
            inputObj.setAttribute("style", 'visibility:hidden');
            inputObj.setAttribute("accept", 'image/png, image/jpeg');
            document.body.appendChild(inputObj);

            inputObj.addEventListener('change', e => {
                this.putLogo(e)
            });

            inputObj.click();
        },
        //存放图片
        async putLogo(e) {
            var file = e.target.files[0];
            const url = URL.createObjectURL(file)
            var str = await this.readImgToBase64(file);
            this.addFrom.projectLogo = str;
            // if(str)
            $("#addFormLogo").css({
                'background': 'url("' + str + '")',
                'background-size': 'cover'
            });
        },
        //打开项目
        async openProject(id) {
            await storage.setItem("projectId", id);
            ipcRenderer.send("openProject", 'openProject');
        },
        //关闭窗口
        close(event) {
            ipcRenderer.send("closeApp", "closeApp")
        },
        //打开添加窗口
        openAddForm(event) {
            $('.addForm').css({ 'background': getRandomCardColor('135deg', '1'), });
            $('.shadowMock').fadeIn(400);
            $('.addForm').fadeIn(400);
        },
        //关闭添加窗口
        closeAddForm(event) {
            $('.shadowMock').fadeOut(300);
            $('.addForm').fadeOut(300);
            //清楚新增页面的数据
            setTimeout(() => {
                this.addFrom = {
                    id: '',
                    projectName: '',
                    projectTime: '',
                    projectLogo: '',
                    sort: '',
                };
                $("#addFormLogo").css({
                    'background': 'url(\'./img/头像.jpg\')',
                    'background-size': 'cover'
                });
            }, 1000)
        },
        //最小化
        minimize(event) {
            ipcRenderer.send("minApp", "minApp")
        },
        readImgToBase64(file) {
            return new Promise((resolve, reject) => {
                try {

                    // 读取信息
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        // 转base64结果
                        const base64Url = reader.result;
                        resolve(base64Url);
                    }

                    reader.onerror = (err) => {
                        reject(err);
                    }

                } catch (error) {
                    reject(error);
                }
            });
        },
        // pop(text) { this.pop(text, 160, 2000) },
        // pop(text, width) { this.pop(text, width, 2000) },
        pop(text, width, time) {
            if(!width){
                width=160;
            }
            if(!time){
                time=2000
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
        },
        //渲染卡片
        atvImg() {
            var d = document,
                de = d.documentElement,
                bd = d.getElementsByTagName('body')[0],
                htm = d.getElementsByTagName('html')[0],
                win = window,
                imgs = d.querySelectorAll('.atvImg'),
                totalImgs = imgs.length,
                supportsTouch = 'ontouchstart' in win || navigator.msMaxTouchPoints;
            // console.log("卡片数量：" + totalImgs);
            if (totalImgs <= 0) {
                return;
            }

            for (var l = 0; l < totalImgs; l++) {

                var thisImg = imgs[l],
                    layerElems = thisImg.querySelectorAll('.atvImg-layer'),
                    totalLayerElems = layerElems.length;

                if (totalLayerElems <= 0) {
                    continue;
                }
                var doms = thisImg.querySelectorAll('.cardInfo');
                while (thisImg.firstChild) {
                    thisImg.removeChild(thisImg.firstChild);
                }

                var containerHTML = d.createElement('div'),
                    shineHTML = d.createElement('div'),
                    shadowHTML = d.createElement('div'),
                    layersHTML = d.createElement('div'),
                    layers = [];

                thisImg.id = 'atvImg__' + l;
                containerHTML.className = 'atvImg-container';
                shineHTML.className = 'atvImg-shine';
                shadowHTML.className = 'atvImg-shadow';
                layersHTML.className = 'atvImg-layers';

                for (var i = 0; i < totalLayerElems; i++) {
                    var layer = d.createElement('div'),
                        imgSrc = layerElems[i].getAttribute('data-img');

                    layer.className = 'atvImg-rendered-layer';
                    layer.setAttribute('data-layer', i);
                    layer.style.backgroundImage = 'url(' + imgSrc + ')';
                    layersHTML.appendChild(layer);
                    layers.push(layer);
                }

                containerHTML.appendChild(shadowHTML);
                containerHTML.appendChild(layersHTML);
                containerHTML.appendChild(shineHTML);
                containerHTML.appendChild(doms[0]);

                thisImg.insertBefore(containerHTML, thisImg.children[0])
                $(".pLogo").each((index, item) => {
                    var index = $(item).attr('index');
                    var logo = this.projects[index].projectLogo;
                    if (logo != null && logo.length > 0) {
                        $(item).css({
                            background: 'url(' + logo + ')',
                            backgroundSize: 'cover'
                        })
                    }
                })

                var w = thisImg.clientWidth || thisImg.offsetWidth || thisImg.scrollWidth;
                thisImg.style.transform = 'perspective(' + w * 3 + 'px)';

                if (supportsTouch) {
                    win.preventScroll = false;
                    (function (_thisImg, _layers, _totalLayers, _shine) {
                        thisImg.addEventListener('touchmove', function (e) {
                            if (win.preventScroll) {
                                e.preventDefault();
                            }
                            processMovement(e, true, _thisImg, _layers, _totalLayers, _shine);
                        });
                        thisImg.addEventListener('touchstart', function (e) {
                            win.preventScroll = true;
                            processEnter(e, _thisImg);
                        });
                        thisImg.addEventListener('touchend', function (e) {
                            win.preventScroll = false;
                            processExit(e, _thisImg, _layers, _totalLayers, _shine);
                        });
                    })(thisImg, layers, totalLayerElems, shineHTML);
                } else {
                    (function (_thisImg, _layers, _totalLayers, _shine) {
                        thisImg.addEventListener('mousemove', function (e) {
                            processMovement(e, false, _thisImg, _layers, _totalLayers, _shine);
                        });
                        thisImg.addEventListener('mouseenter', function (e) {
                            processEnter(e, _thisImg);
                        });
                        thisImg.addEventListener('mouseleave', function (e) {
                            processExit(e, _thisImg, _layers, _totalLayers, _shine);
                        });
                    })(thisImg, layers, totalLayerElems, shineHTML);
                }
            }

            function processMovement(e, touchEnabled, elem, layers, totalLayers, shine) {
                var bdst = bd.scrollTop || htm.scrollTop,
                    bdsl = bd.scrollLeft,
                    pageX = (touchEnabled) ? e.touches[0].pageX : e.pageX,
                    pageY = (touchEnabled) ? e.touches[0].pageY : e.pageY,
                    offsets = elem.getBoundingClientRect(),
                    w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth,
                    h = elem.clientHeight || elem.offsetHeight || elem.scrollHeight,
                    wMultiple = 320 / w,
                    offsetX = 0.52 - (pageX - offsets.left - bdsl) / w,
                    offsetY = 0.52 - (pageY - offsets.top - bdst) / h,
                    dy = (pageY - offsets.top - bdst) - h / 2,
                    dx = (pageX - offsets.left - bdsl) - w / 2,
                    yRotate = (offsetX - dx) * (0.07 * wMultiple),
                    xRotate = (dy - offsetY) * (0.1 * wMultiple),
                    imgCSS = 'rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg)',
                    arad = Math.atan2(dy, dx),
                    angle = arad * 180 / Math.PI - 90;

                if (angle < 0) {
                    angle = angle + 360;
                }

                if (elem.firstChild.className.indexOf(' over') != -1) {
                    imgCSS += ' scale3d(1.07,1.07,1.07)';
                }
                elem.firstElementChild.style.transform = imgCSS;

                shine.style.background = 'linear-gradient(' + angle + 'deg, rgba(255,255,255,' + (pageY - offsets.top - bdst) / h * 0.4 + ') 0%,rgba(255,255,255,0) 80%)';
                shine.style.transform = 'translateX(' + (offsetX * totalLayers) - 0.1 + 'px) translateY(' + (offsetY * totalLayers) - 0.1 + 'px)';

                var revNum = totalLayers;
                for (var ly = 0; ly < totalLayers; ly++) {
                    layers[ly].style.transform = 'translateX(' + (offsetX * revNum) * ((ly * 2.5) / wMultiple) + 'px) translateY(' + (offsetY * totalLayers) * ((ly * 2.5) / wMultiple) + 'px)';
                    revNum--;
                }
            }

            function processEnter(e, elem) {
                elem.firstChild.className += ' over';
            }

            function processExit(e, elem, layers, totalLayers, shine) {
                var container = elem.firstChild;

                container.className = container.className.replace(' over', '');
                container.style.transform = '';
                shine.style.cssText = '';

                for (var ly = 0; ly < totalLayers; ly++) {
                    layers[ly].style.transform = '';
                }

            }

        }

    }

})