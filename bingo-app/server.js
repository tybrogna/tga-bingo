import Database from './database.js'
import express from 'express'
import http from 'http'
import https from 'https'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// console.log(process.env)

let app = express()
app.use(express.json())
// app.use(express.static('public'))
// app.use(express.static('public/img'))
app.use(express.static('dist'))
app.use(express.static('dist/img'))

let db = new Database()
await db.connect()
process.on('exit', async () => {
    await db.disconnect();
})

app.get('/vitezone', async (req, res) => {
    res.sendFile('./index.html', {root: __dirname})
})

app.get('/', async (req, res) => {
    console.log("pls update")
    res.sendFile('./public/index.html', {root: __dirname})
})

app.get('/testAdd', async(req, res) => {
    await db.qaAdd('Briblham')
    res.send('yep ok')
})

app.get('/testRead', async (req, res) => {
    res.send(await db.queryAllTiles())
})

app.post('/SubmitTile', async(req, res) => {
    console.log(req.body)
    let tileUpload = JSON.parse(req.body)

    res.send('got a post. check logs')
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