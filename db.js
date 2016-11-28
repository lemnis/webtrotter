// modules
const low = require('lowdb');
const uuid = require('uuid');

const db = low('non-existing.json');
db.defaults({ urls: [], posts: [] }).value();

exports.insertUrl = function(referenceID, hostname, calculatedRoute, urlString){
    var id = db.get('urls')
        .push({ id: uuid(), hostname, traceroute: calculatedRoute, urls: [urlString] })
        .value().id;

    return {
        type: "INSERT",
        referenceID,
        dbID: id
    };
}

//
//
// db.defaults({ posts: [], user: {} })
//   .value()
//
// db.get('posts')
//   .push({ id: 1, title: 'lowdb is awesome'})
//   .value()
//
// db.set('user.name', 'typicode')
//   .value()
//
//   function insertIntoDatabase(referenceID, hostname, calculatedRoute, urlString){
//       return new Promise((resolve, reject) => {
//           db.serialize(() => {
//               db.run('INSERT INTO urls (hostname, traceroute, urls) VALUES (?, ?, ?);',
//               [ hostname, JSON.stringify(calculatedRoute), JSON.stringify([urlString]) ],
//               function(err) {
//                   if(err){
//                       reject(err);
//                   } else {
//                       resolve({
//                           type: "INSERT",
//                           referenceID,
//                           dbID: this.lastID
//                       });
//                   }
//               });
//           });
//       });
//   }
