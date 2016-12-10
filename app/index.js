// http://stackoverflow.com/questions/32504307/how-to-use-sqlite3-module-with-electron
const extension_id = "lhljnbjkfgdgbdkhbikpcajdlpciimcd";

const {app, BrowserWindow, ipcMain, dialog, shell} = require('electron')

const fs = require('fs');
const path = require('path');
const url = require('url'); // used for extracting the hostnames from the full urls

const nativeMessage = require('chrome-native-messaging');
// const maxmind = require('maxmind');
const traceroute = require('traceroute');
const db = require("./db.js");
const DB_CONSTANTS = require("../shared/db_constants.json");

process.stdin
.pipe(new nativeMessage.Input())
.pipe(new nativeMessage.Transform((msg, push, done) => {
    const hostname = url.parse(msg.url).hostname;
    if(msg.type == DB_CONSTANTS.UPDATE){
        push(db.addUrl(msg.referenceID, msg.url));
    } else {
        push(db.insertUrl({
            id: msg.id,
            hostname,
            traceroute: [],
            urls: [msg.url],
            timestamp: msg.timestamp
        }));
        if(mainWindow.webContents){
            mainWindow.webContents.on('did-finish-load', () => {
                mainWindow.webContents.send('angular.websites', db.getRequests())
            })
        }
        getTraceroute(hostname).then(calculatedRoute => {
            db.insertTraceroute(msg.id, calculatedRoute);
        }, error => push({err: error})); // #TODO:0 handle error messages somewhere may be visual
    }
    done();
}))
.pipe(new nativeMessage.Output())
.pipe(process.stdout);

function getTraceroute(hostname){
    return new Promise((resolve, reject) => {
        traceroute.trace(hostname, (err, hops) => {
            if (err){
                reject(Error(err));
            } else {
                resolve(hops);
            }
        });
    });
}

// Keep a global reference of the window object
let mainWindow

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600})

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('angular.websites', db.getRequests())
    })

    // console.log(app.getPath("exe") + "/../../bash");

    // var manifest_path = app.getPath("home") + '/Library/Application Support/Google/Chrome/NativeMessagingHosts/webtrotter.lemnis.github.io.json';
    // fs.access(
    //     manifest_path,
    //     fs.constants.W_OK,
    //     (err) => {
    //         // console.log(err);
    //         // if(err.code == "ENOENT"){ // file doesn't exist
    //         fs.writeFile(manifest_path, chromeNativeMessagingManifest(), (err) => {
    //             if (err) throw err;
    //             }
    //         );
    //         // }
    //     }
    // );

    fs.access(
        app.getPath("home") + '/Library/Application Support/Google/Chrome/Default/Extensions/' + extension_id,
        fs.constants.F_OK,
        (err) => {
            if(err){
                dialog.showMessageBox(mainWindow,
                    {
                        message: "Look like the extension isn't installed",
                        detail: "We can help you to install the needed extension.",
                        buttons: ["cancel", "install extension"]
                    },
                    function(response){
                        if(response == 1){
                            shell.openExternal('https://lemnis.github.io/webtrotter');
                        }
                    }
                )
            }
        }
    );
}

// electron is initializated
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit();
});

function chromeNativeMessagingManifest(){
    return JSON.stringify({
        "name": "webtrotter.lemnis.gihub.io",
        "description": "Webtrotter",
        "path": app.getPath("exe") + "/../../Resources/app/bash",
        "type": "stdio",
        "allowed_origins": [
            "chrome-extension://"+ extension_id +"/"
        ]
    });
}
