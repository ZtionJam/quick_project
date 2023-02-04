const { db, dbEx, newData, storage } = require('./sqlite')
var config = {
    'auther': 'ZtionJam',
    'versionNum': '0.8',
    'versionName': '0.8bata',
    'mainVersion': '1',
    'projectId': '0',
    'asarReleasesUrl': 'https://api.github.com/repos/ZtionJam/QP_AsarUpdate/releases',
    'autoUpdateAsar': 'true',
    'todayNoUpdate': '6'
};
var needCreat = [];
for (let key in config) {
    dbEx.each(`select count(key) as total from config where key='${key}'`, row => {
        if (row.total == 0) {
            dbEx.insert(`INSERT INTO "config" ("key", "value") VALUES ('${key}', '${config[key]}')`);
        }
    })
}

module.exports = { config };
