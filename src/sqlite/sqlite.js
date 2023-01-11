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
    return new Promise(function (resolve, reject) {
      db.serialize(function () {
        db.each(query, function (err, row) {
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
  }
}



module.exports = { db, dbEx };
