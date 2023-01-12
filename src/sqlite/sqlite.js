const path = require('path')
const sqlite3 = require("sqlite3").verbose();


var dbPath = path.join(__dirname + '../../../', 'data');
var db = new sqlite3.Database(dbPath, (err) => {
  if (err) throw err;
  console.log('sqlite链接成功')
})
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
  }
}



module.exports = { db, dbEx };
