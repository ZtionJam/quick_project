const { ipcRenderer } = require('electron');
const path = require('path')
const { db, dbEx } = require(path.join(__dirname + "/sqlite/", 'sqlite'))

var $ = require('jquery');
var app = new Vue({
    el: '#box',
    data: {
        title: '首页',
        addFrom: {
            projectName: '',
            projectTime: '',
            projectLogo: '',
            sort: '',
        },
        projects: []
    },
    async created() {
        //加载数据
        var sql = "select * from project order by sort desc";
        await dbEx.each(sql, (row) => {
            var project = {
                id: row.id,
                projectName: row.projectName,
                projectTime: row.projectTime,
                projectLogo: row.projectLogo
            }
            this.projects.push(project)
            this.atvImg()
            this.$nextTick(()=>{
                this.atvImg();
            })
        })
    },
    async mounted() {
    },
    methods: {
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
            var sql = `INSERT INTO 
            project ( "id", "projectName", "projectTime", "projectLogo", "sort" )
            VALUES( '${Date.now()}', '${this.addFrom.projectName}', '${this.addFrom.projectTime}', '${this.addFrom.projectLogo}', '${this.addFrom.sort}' );`;
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
                        projectLogo: ''
                    };
                    $("#addFormLogo").css({
                        'background': 'url(\'./img/头像.jpg\')',
                        'background-size': 'cover'
                    });
                }, 1000)

            })
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
            $("#addFormLogo").css({
                'background': 'url("' + str + '")',
                'background-size': 'cover'
            });
        },
        //打开项目
        openProject(event) {

            ipcRenderer.send("openProject", "openProject")
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
            console.log("卡片数量：" + totalImgs);
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
                    if (logo != null) {
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