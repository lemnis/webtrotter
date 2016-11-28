// http://stackoverflow.com/questions/32504307/how-to-use-sqlite3-module-with-electron
const {app, BrowserWindow, ipcMain} = require('electron')

const path = require('path')
const url = require('url'); // used for extracting the hostnames from the full urls

const nativeMessage = require('chrome-native-messaging');
// const maxmind = require('maxmind');
const traceroute = require('traceroute');
const db = require("./db.js");

process.stdin
    .pipe(new nativeMessage.Input())
    .pipe(new nativeMessage.Transform((msg, push, done) => {
        const hostname = url.parse(msg.url).hostname;
        if(msg.dbID){
            addURLToDatabase(msg.referenceID, msg.dbID, msg.url).then(data => {
                push(data);
                done();
            }, error => push({err: error})); // #TODO:0 handle error messages somewhere may be visual
        } else {
            getTraceroute(hostname).then(calculatedRoute => {
                var res = db.insertUrl(msg.referenceID, hostname, calculatedRoute, msg.url);
                push(res);
                push({res: "succes"});
            }, error => push({err: error})); // #TODO:0 handle error messages somewhere may be visual
        }
    }))
    .pipe(new nativeMessage.Output())
    .pipe(process.stdout);

function insertIntoDatabase(referenceID, hostname, calculatedRoute, urlString){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('INSERT INTO urls (hostname, traceroute, urls) VALUES (?, ?, ?);',
            [ hostname, JSON.stringify(calculatedRoute), JSON.stringify([urlString]) ],
            function(err) {
                if(err){
                    reject(err);
                } else {
                    resolve({
                        type: "INSERT",
                        referenceID,
                        dbID: this.lastID
                    });
                }
            });
        });
    });
}
var res = db.insertUrl(1, "google.nl", [], "test.nl");
console.log("hey",res);
//
// function addURLToDatabase(referenceID, id, url){
//     return new Promise((resolve, reject) => {
//         db.serialize(() => {
//             db.each('SELECT id, urls FROM urls WHERE id = ?', [id], function(err,row){
//                 if(err){
//                     reject(err);
//                 } else {
//                     var newUrls = JSON.parse(row.urls);
//                     newUrls.push(url);
//
//                     db.run('UPDATE urls SET urls = ? WHERE id = ?', [JSON.stringify(newUrls), id], function(err){
//                         if(err){
//                             reject(err);
//                         } else {
//                             resolve({
//                                 type: "UPDATE",
//                                 referenceID,
//                                 dbID: id
//                             })
//                         }
//                     });
//                 }
//             });
//         });
//     });
// }
//
// function getTraceroute(hostname){
//     return new Promise((resolve, reject) => {
//         traceroute.trace(hostname, (err, hops) => {
//             if (err){
//                 reject(Error(err));
//             } else {
//                 resolve(hops);
//             }
//         });
//     });
// }
//
//
// // Keep a global reference of the window object, if you don't, the window will
// // be closed automatically when the JavaScript object is garbage collected.
// let mainWindow
//
// function createWindow () {
//   // Create the browser window.
//   mainWindow = new BrowserWindow({width: 800, height: 600})
//
//   // and load the index.html of the app.
//   mainWindow.loadURL(url.format({
//     pathname: path.join(__dirname, 'index.html'),
//     protocol: 'file:',
//     slashes: true
//   }))
//
//   // Open the DevTools.
//   mainWindow.webContents.openDevTools()
//
//   // Emitted when the window is closed.
//   mainWindow.on('closed', function () {
//     // Dereference the window object, usually you would store windows
//     // in an array if your app supports multi windows, this is the time
//     // when you should delete the corresponding element.
//     mainWindow = null
//   })
// }
//
// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
//
// // Quit when all windows are closed.
// app.on('window-all-closed', function () {
//   // On OS X it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })
//
// app.on('activate', function () {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (mainWindow === null) {
//     createWindow()
//   }
// })
//
// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and require them here.
//
// //
// // var sqlite3 = require('sqlite3').verbose();
// // var db = new sqlite3.Database('/Users/lisa/Library/Application\ Support/Google/Chrome/Default/History.sqlite');
// //
// // db.serialize(function() {
// //   db.each("SELECT \
// //   datetime(visit_time / 1000000 + (strftime('%s', '1601-01-01')), 'unixepoch') AS time, \
// //    urls.title, \
// //    urls.url \
// //    FROM \
// //     visits \
// //     inner join urls on urls.id = visits.url \
// //     ORDER BY visit_time DESC \
// //     LIMIT 5;", function(err, row) {
// //       mainWindow.webContents.send('store-data', row);
// //       console.log(row);
// //       mainWindow.webContents.on('did-finish-load', () => {
// //           mainWindow.webContents.send('store-data', row)
// //         })
// //
// //   });
// // });
// //
// // db.close();
// //
// // ipcMain.on('asynchronous-message', (event, arg) => {
// //   console.log(arg)  // prints "ping"
// //   event.sender.send('asynchronous-reply', 'pong')
// // })
// //
// // ipcMain.on('synchronous-message', (event, arg) => {
// //   console.log(arg)  // prints "ping"
// //   event.returnValue = 'pong'
// // })
//
// db.serialize(() => {
//     var rows = [];
//     db.each('SELECT * FROM urls', function(err,row){
//         rows.push(row);
//     }, function(){
//         mainWindow.webContents.on('did-finish-load', () => {
//             mainWindow.webContents.send('store-data', rows)
//         })
//     });
// });
