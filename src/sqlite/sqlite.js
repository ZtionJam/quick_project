const path = require('path')
const sqlite3 = require("sqlite3").verbose();
const fs = require('fs')
var db = {};
//初始化数据库

var dbPath = process.cwd().toString() + "/data/data";
var newData = false;
if (fs.existsSync(dbPath)) {
  newData = false;
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) throw err;
    console.log('sqlite链接成功')
  })
} else {
  db = new sqlite3.Database(dbPath, async (err) => {
    if (err) throw err;
    console.log('初始化sqlite.....')
  })
  newData = true;
}

const dbEx = {
  //sql查询
  quryBysql: (sql) => {
    var data = {};
    db.serialize(() => {
      ret = db.each(sql, function (err, row) {
        console.log(sql)
        if (err) throw err;
        data = row;
      });
    })
    return data;
  },
  //取配置
  getConfig: (key) => {
    var data = {};
    var sql = "select value from config where key='" + key + "'";
    db.serialize(() => {
      db.each(sql, function (err, row) {
        if (err)
          throw err;
        data = row;
      });
    })
    console.log("配置" + data)
    return data;
  },
  //查询
  each: (query, action) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.each(query, (err, row) => {
          if (err) reject("Read error: " + err.message)
          else {
            if (row) {
              action(row)
              resolve(true)
            }
          }
        })
      })
    })
  },
  //插入
  insert: (query) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(query, (err) => {
          if (err) {
            reject("Read error: " + err.message)
          } else {
            resolve(true)
          }
        })
      })
    })
  },
  //更新
  update: (query) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(query, (err) => {
          if (err) {
            reject("Read error: " + err.message)
          } else {
            resolve(true)
          }
        })
      })
    })
  },
  //初始化表
  initTable: () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(projectTable, (err) => { });
        db.run(cardTable, (err) => { });
        db.run(dataTable, (err) => { });
        db.run(configTable, (err) => { });
        resolve(true)
      })
    })
  },
  //添加初始的示例数据
  insertDemo: () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(insertProjectSql, (err) => { });
        db.run(insertCardSql, (err) => { });
        db.run(insertData1Sql, (err) => { });
        db.run(insertData2Sql, (err) => { });
        resolve(true)
      })
    })
  }
}
var insertProjectSql = `INSERT INTO "main"."project" ("id", "projectName", "projectTime", "projectLogo", "sort") VALUES ('1674650586736', '示例项目', '2023-01-01', './img/头像.jpg', '1');`
var insertCardSql = `INSERT INTO "main"."card" ("id", "projectId", "title", "sort") VALUES ('1674650648679', '1674650586736', '示例数据', 1);`
var insertData1Sql = `INSERT INTO "main"."data" ("id", "cardId", "name", "value", "type", "sort") VALUES ('1674650648781', '1674650648679', '名称', '值', 'text', 2);`
var insertData2Sql = `INSERT INTO "main"."data" ("id", "cardId", "name", "value", "type", "sort") VALUES ('1674650648758', '1674650648679', '名称', '值', 'text', 1);`

var projectTable = `CREATE TABLE "project" (
  "id" text NOT NULL,
  "projectName" text,
  "projectTime" text,
  "projectLogo" blob,
  "sort" TEXT,
  PRIMARY KEY ("id")
);`;
var cardTable = `CREATE TABLE "card" (
  "id" text NOT NULL,
  "projectId" text,
  "title" TEXT,
  "sort" integer,
  PRIMARY KEY ("id")
);`;
var dataTable = `CREATE TABLE "data" (
  "id" text NOT NULL,
  "cardId" text,
  "name" TEXT,
  "value" TEXT,
  "type" TEXT,
  "sort" integer,
  PRIMARY KEY ("id")
);`;
var configTable = `CREATE TABLE "config" (
  "key" TEXT,
  "value" TEXT
);`;

module.exports = { db, dbEx, newData };
