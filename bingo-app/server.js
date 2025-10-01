import Database from './db/database.js'
import express from 'express'
// import bodyParser from 'body-parser'
import http from 'http'
import https from 'https'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// console.log(process.env)

let app = express()
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('dist'))
app.use(express.static('dist/img'))

let db = new Database()
await db.connect()
process.on('exit', async () => {
    await db.disconnect()
})

app.get('/testAdd', async(req, res) => {
    await db.qaAdd('Briblham')
    res.send('yep ok')
})

app.get('/testRead', async (req, res) => {
    res.send(await db.queryAllTiles())
})

app.get('/testReadUserTiles', async (req, res) => {
    res.send(await db.allTilesFromUser('test@qa.com'))
})

app.post('/SubmitTile', async(req, res) => {
    console.log(req.body)
    for (let [key, val] of Object.entries(req.body)) {
        console.log(key, ':', val)
    }
    res.send('got it')
})

app.post('/getTiles', async (req, res) => {
    let id = req.query.id
    let event = req.query.event
    let queryStr
})

// Order DOES matter, everything before this will be prioritized
// and this basically means that anything that isn't apart of the api
//   falls onto the preact router to handle
app.get('*', async (req, res) => {
    res.sendFile('./dist/index.html', {root: __dirname})
})

const [server, port] = (() => {
    let server, port
    try {
        let keyFile = fs.readFileSync('/etc/letsencrypt/live/tga.bingo/privkey.pem')
        let certFile = fs.readFileSync('/etc/letsencrypt/live/tga.bingo/cert.pem')
        let chainFile = fs.readFileSync('/etc/letsencrypt/live/tga.bingo/fullchain.pem')
        let options = {
            key: keyFile,
            cert: certFile,
            ca: chainFile
        }
        server = https.createServer(options, app)
        port = 443
        return [server, port]
    } catch (err) {
        server = http.createServer(app)
        port = 3000
        return [server, port]
    }
})()

server.listen(port, (err) =>{
    if (!err) {
        console.log('its on at ' + port)
    }
})
