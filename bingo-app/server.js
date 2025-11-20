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
app.use(express.static('dist/img'))
// app.use(express.static('dist/img'))
app.use(express.static('uploads'))

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

let upload = multer({ dest: './uploads/' })
let imageUpload = upload.array('images')
app.post('/SubmitTile', imageUpload, async(req, res) => {
    //TODO: data validation
    let imgLocArr = []
    console.log(req.body)
    for (let a = 0; a < req.files.length; a++) {
        console.log(req.files[a].path)
        fs.stat(req.files[a].path, (err, stats) => {
            console.log(stats)
        })
        let betterName = ""
        req.body[`title${a+1}`].split(' ').forEach(word => betterName += word[0])
        betterName += (new Date().valueOf() % 100000).toString()
        betterName += ".jpg"
        console.log(betterName)
        sharp(req.files[a].path)
            .jpeg({ quality: 60, mozjpeg: true })
            .toFile(betterName)
            .then(() => fs.unlinkSync(req.files[a].path))
        fs.stat(betterName, (err, stats) => {
            console.log(stats)
        })

        imgLocArr.push(betterName)
    }
    
    db.addTile(req.body, imgLocArr)
    // console.log(req.body)
    // console.log(req.files)
})

// Remove-Item $img
// $img = Get-ChildItem $newname
// magick $img.name -resize 400x400 -strip -interlace Plane -quality 50 $img.name


app.get('/getTiles/:eventName/:eventYear/:seed', async (req, res) => {
    let random = getPRNG(req.params.seed)
    let tilesToShuffle = await db.queryTilesForCard(req.params.eventName, req.params.eventYear)
    console.log(tilesToShuffle)
    // let tilesToSendIdxes = range(tilesToShuffle.length)
    tilesToShuffle = shuffle(tilesToShuffle, random)
    console.log(tilesToShuffle)
    let tilesToSend = []
    for (let a = 0; a < 24; a++) {
        tilesToSend.push(tilesToShuffle[a])
    }

    console.log(tilesToSend)
    
    res.send(tilesToSend)
})

// app.get('/images/:imgLoc', async (req, res) => {
//     console.log(req.params.imgLoc)
//     console.log(`./uploads/${req.params.imgLoc}`)
//     res.sendFile(`./uploads/${req.params.imgLoc}`, {root: __dirname})
// })

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
