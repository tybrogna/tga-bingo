import Database from './db/database.js'
import express from 'express'
import cors from 'cors'
import { getPRNG, shuffle } from './jsx-src/js/randomHelper.js'
import { range } from './jsx-src/js/functionhider.js'
// import bodyParser from 'body-parser'
import http from 'http'
import https from 'https'
import fs from 'fs'
import multer from 'multer'
import sharp from 'sharp'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const upload = multer({ dest: 'uploads/' })
// console.log(process.env)

let app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('dist'))
// app.use(express.static('dist/img'))
app.use(express.static('../uploads'))

let db = new Database()
await db.connect()
process.on('exit', async () => {
    await db.disconnect()
})

// const provider = new ConfigFileAuthenticationDetailsProvider(
//   "./.oci/config",
//   "DEFAULT"
// );

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

app.get('/eventTiles/:event', async (req, res) => {
    res.send(await db.queryTilesForCard)
})

app.get('/events/:active', async (req, res) => {
    res.send(await db.queryAllEvents(req.params.active))
})

let upload = multer({ dest: '/uploads/' })
let imageUpload = upload.array('images')
app.post('/SubmitTile', imageUpload, async(req, res) => {
    let imgLocArr = []
    for (let a = 0; a < req.files.length; a++) {
        let file = req.files[a].path
        console.log(file)
        // fs.stat(req.files[a].path, (err, stats) => { console.log(stats.size) })
        let betterName = file
        betterName = betterName.replace(/[^a-z0-9\ ]/gi, '')
        betterName = betterName.trim()
        betterName = betterName.toLowerCase()
        betterName = betterName.split(' ').reduce((acc, word) => acc += word[0], "")
        betterName += (new Date().valueOf() % 100000).toString().padStart(5, '0')
        betterName += ".jpg"
        console.log(betterName)
        sharp(file)
            .jpeg({ quality: 60, mozjpeg: true })
            .toFile(file.slice(0, file.lastIndexOf('/')+1) + betterName)
            .then(() => fs.unlinkSync(file))
        // fs.stat(req.files[a].path, (err, stats) => { console.log(stats.size) })

        imgLocArr.push(betterName)
    }
    if (req.body.isFreeTile) {
        db.addOrUpdateFree(req.body, imgLocArr)
    } else {
        db.addTile(req.body, imgLocArr)
    }
})

app.get('/getTiles/active/:seed', async (req, res) => {
    let latestEvent = await db.queryAllEvents(true)
    res.send(
        await getTiles(latestEvent.name, latestEvent.year, req.params.seed)
    )
})

app.get('/getTiles/:eventName/:eventYear/:seed', async (req, res) => {
    res.send(await getTiles(req.params.eventName, req.params.eventYear, req.params.seed))
})

async function getTiles(eventName, eventYear, seed) {
    let random = getPRNG(seed)
    let tileClusters = await db.queryTileClustersForCard(eventName, eventYear)
    console.log(tileClusters)
    tileClusters = shuffle(tileClusters, random)
    tileClusters = tileClusters.slice(0, 24)
    let tilesToSend = tileClusters.map(cluster => {
        let tileIds = cluster.tile_ids.split(',')
        if (tileIds.length == 1) {
            return tileIds[0]
        }
        let pick = Math.floor(random() * tileIds.length)
        return tileIds[pick]
    })

    return await db.getAllTilesById(tilesToSend)
}

// Order DOES matter, everything before this will be prioritized
// and this basically means that anything that isn't apart of the api
//   falls onto the preact router to handle
app.get('*', async (req, res) => {
    res.sendFile('./dist/index.html', {root: __dirname})
})

const [server, port] = (() => {
    return [http.createServer(app), 3000]
    let server, port
    try {
        let keyFile = fs.readFileSync('/etc/letsencrypt/live/tga.zone/privkey.pem')
        console.log(keyFile)
        let certFile = fs.readFileSync('/etc/letsencrypt/live/tga.zone/cert.pem')
	console.log(certFile)
        let chainFile = fs.readFileSync('/etc/letsencrypt/live/tga.zone/fullchain.pem')
	console.log(chainfile)
	let options = {
            key: keyFile,
            cert: certFile,
            ca: chainFile
        }
        server = https.createServer(options, app)
        port = 443
        return [server, port]
    } catch (err) {
        console.log(err)
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
