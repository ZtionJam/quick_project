<div align="center"> <img src="https://res.ztion.cn/imgs/1673924957110.png" width = 200 /> </div> </div>

<p align="center">
  Quick_Project：基于electron的信息管理工具
</p>

# 简介

平时在做开发的时候，总要记录一些项目信息，比如工作安排排班时间，墨刀原型，蓝湖UI，测试数据库，nacos等信息，写在文本或者excel里又不直观又不好操作，遂开发此工具

基于electron的项目信息管理工具，可用于保存项目信息，收藏地址，账号密码箱等

基本功能已完成

# 截图

![image-20230118205056094](https://res.ztion.cn/imgs/1674046257908.png)

# 技术

[已完成功能_及使用方式](https://github.com/ZtionJam/quick_project/blob/master/help.md)

使用基于NodeJS的Electron打包，Vue 2（script方式引入）+jQuery布局，Sqlite3做本地缓存，所有操作都有动画过渡，丝滑！

# 功能

- `[已完成]`**布局**：所有页面的布局以及设计

- `[已完成]`**项目管理**：首页项目添加

- `[已完成]`**项目管理动画**：跟随鼠标浮动的动画

- `[已完成]`**本地缓存**：所有数据均从所在目录的/data/data操作，使用SQlite3

- `[已完成]`**内容页面**：从data取数据，瀑布流布局，以及细节动画

- `[已完成]`**内容添加**：添加内容界面的卡片信息，可以多条配置

- `[已完成]`**渐变色**：第二页面全局采用渐变色，添加一键换颜色的按钮

- `[已完成]`**日志文件**：在安装目录创建日志文件

- `[已完成]`**复制**：所有内容都可以一键复制

- `[已完成]`**内容页面**：内容页面的卡片的修改和删除

- `[已完成]`**首页**：首页的修改和删除

- -------------------------------------------------------------------

- `[开发中]`**内容页面动画**：从首页跳转到内容页面时，有一个加载动画的过渡

- `[开发中]`**内容页面**：一个统一控制排序的功能

- `[开发中]`**设置**：做一个设置功能来配置一下基本设置，比如卡片背景什么的

  

- -----------------------------------------------------------------------------------

- `[待开发]`**数据文件**：启动时检测安装目录数据数据文件是否存在，不存在则创建一个默认的

- `[待开发]`**导出**：将项目信息导出为Excel或者md

- `[待开发]`**数据类别**：配置的数据可以设置类型，url或文件夹可以直接点击打开

- `[待开发]`**内置使用说明**：加个使用帮助按钮

## 安全

- 全程不发起任何网络请求！
- 所有数据均放在启动目录的/data/data文件中，自行备份
- 迁移时，只需要把data文件拷贝过去就可以了

# 问题

- 为什么不直接用Electron-Vue? =》Node老报错，忍不了
- 为什么不用Vue的瀑布流插件? =》 Node老报错，忍不了

# 声明

- 软件涉及到的引用的图片以及影音均来自网络，侵删，仅限于个人学习使用！请勿用于任何商业用途
- 

# 期望

> 欢迎提出更好的意见

# 版权

[GPL 3.0](https://www.gnu.org/licenses/gpl-3.0.html)

# 作者

一个纯Java后端，不会搞前端，这个工具边百度边做，还有一堆功能没实现，欢迎各位帮忙

# 联系方式

微信:

![image-20230118211145845](https://res.ztion.cn/imgs/1674047507177.png)