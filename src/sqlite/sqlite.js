const { open } = require("sqlite");
const sqlite3 = require("sqlite3").verbose();
//dbPath为你想存放数据库文件的目录路径
const connectDb = (dbPath) => {
  return open({
    filename: '../data',
    driver: sqlite3.Database,
  });
};

module.exports = { connectDb };
