import express from 'express'
import cors from 'cors'
import http from 'http'
import https from 'https'
import fs from 'fs'
import multer from 'multer'
import sharp from 'sharp'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { getPRNG, shuffle } from './jsx-src/js/randomHelper.js'
import Database from './db/database.js'
// import { range } from './jsx-src/js/functionhider.js'

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

function serverCron() {
    let now = Math.floor(new Date().getTime() / 1000)
    let lastWeek = now - 604800
    
    // update platform list
    //   get all platforms
    //     fields id,name,abbreviation,alternative_name;limit 500; sort id;
    // get games this week in america
    //   let now = gmt.now()
    //   let lastWeek = now - 604800
    //     fields id,game,date; where date > lastWeek & date < now & release_region = 8; sort date desc; limit 500;
    // assemble a giant string to get the list of games
    // get games released this week
        // fields
        //   id,
        //   name,
        //   cover,
        //   platforms,
        //   first_release_date,
        //   game_type,
        //   game_status,
        //   keywords,
        //   parent_game,
        //   involved_companies.company.name,
        //   involved_companies.developer,
        //   involved_companies.porting,
        //   involved_companies.publisher;
        // where [giant list]; sort id desc;
    // cull by game_type (0, 2, 4, 7, 8, 9, 11)
    //   main_game, expansion, standalone_expansion, season, remake, remaster, port
    // cull by game_status (null, 0, 4)
    //   no value, released, early_access
    // for each game
    //   check if igdb_id is already in database
    //     update from early_access if the game released
    //     update with VR if VR mode was inexplicalby added
    //     update publisher/developer if missing
    //   compile igdb_id, name, release date, developer, publisher, igdb_cover_id
    //   check if free to play
    //     keywords contains id 2385
    //   check if early_access
    //     game_status = 4
    //   check if remaster
    //      game_type = 9
    //   check if mobile
    //      platform contains id 34, 39
    //         android, ios
    //   check if VR supported
    //      platform contains id 162, 163, 165, 384, 385, 386, 387, 388, 390, 471, 472,
    //         Oculus VR, Steam VR, PSVR, Quest, Rift, Quest 2, Go, Gear VR, PSVR2, Quest 3, VisionOS
    //   check if expansion
    //      game_type = 2,4
    //         mark game as ongoing
    //   check if this game is an update to a f2p game
    //      check if parent_game is in the database
    //      record parent game id, get ready for second pass
    //   second pass, does this again but marks the game as ongoing



}

// const provider = new ConfigFileAuthenticationDetailsProvider(
//   "./.oci/config",
//   "DEFAULT"
// );

// app.get('/testAdd', async(req, res) => {
//     await db.qaAdd('Briblham')
//     res.send('yep ok')
// })

app.post('/testadduser', async (req, res) => {
    try {
        let hashedPass = await bcrypt.hash(req.body.password, 10)
        await db.createUser(req.body.email, req.body.userName, hashedPass)

    } catch(err) {
        console.log(err)
        res.json({ error: err })
    }
})


let secret = I7xBbvH0EZIOJ68rT5a8o96wumip77lhW4urADAXd7SiD9dQm1QfMVOT4SgIQd2p

app.post('/testlogin', async (req, res) => {
    let email = req.body.email
    let username = req.body.username
    let password = req.body.password
    let dbUser = await db.retrieveUser(email, username)
    if (!dbUser) {
        return res.json({ error: "User not found" })
    }

    try {
        let match = await bcrypt.compare(password, dbUser.password_hash)
        if (match) {
            let token = jwt.sign(JSON.stringify(dbUser), secret)
            res.json({ token: token })
        } else {
            res.json({ error: "Password incorrect" })
        }
    } catch(err) {
        console.log(err)
        res.json({ error: err })
    }
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
        // fs.stat(req.files[a].path, (err, stats) => { console.log(stats.size) })
        let betterName = req.body[`title${a+1}`]
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
        db.addOrUpdateFreeTile(req.body, imgLocArr)
    } else {
        db.addTile(req.body, imgLocArr)
    }
})

app.get('/getTiles/active/:seed', async (req, res) => {
    let latestEvent = (await db.queryAllEvents(true))[0]
    res.send(
        await getTiles(latestEvent.name, latestEvent.year, req.params.seed)
    )
})

app.get('/getTiles/:eventName/:eventYear/:seed', async (req, res) => {
    res.send(
        await getTiles(req.params.eventName, req.params.eventYear, req.params.seed)
    )
})

async function getTiles(eventName, eventYear, seed) {
    let random = getPRNG(seed)
    let tileClusters = await db.queryTileClustersForCard(eventName, eventYear)
    let freeTile = tileClusters[0]
    tileClusters = tileClusters.slice(1)
    tileClusters = shuffle(tileClusters, random)
    tileClusters = tileClusters.slice(0, 24)
    let tilesToSend = [freeTile.tile_ids].concat(tileClusters.map(cluster => {
        let tileIds = cluster.tile_ids.split(',')
        if (tileIds.length == 1) {
            return tileIds[0]
        }
        let pick = Math.floor(random() * tileIds.length)
        return tileIds[pick]
    }))

    return await db.getAllTilesById(tilesToSend)
}

app.get('/getAllTiles/active', async (req, res) => {
    let latestEvent = (await db.queryAllEvents(true))[0]
    res.send(
        await getAllTiles(latestEvent.name, latestEvent.year)
    )
})

app.get('/getAllTiles/:eventName/:eventYear/', async (req, res) => {
    res.send(
        await getAllTiles(req.params.eventName, req.params.eventYear)
    )
})

async function getAllTiles(eventName, eventYear, seed) {
    let tileClusters = await db.queryTileClustersForCard(eventName, eventYear)
    let tilesToGet = []
    let tilesInClusterIds = tileClusters.map(cluster => {
        let tileIds = cluster.tile_ids.split(',')
        if (tileIds.length == 1) {
            tilesToGet.push(tileIds[0])
            return tileIds[0]
        }
        tilesToGet.push(...tileIds)
        return tileIds
    })
    let allTilesForEvent = await db.getAllTilesById(tilesToGet)
    let tilesToSend = tilesInClusterIds.map(idArr => {
        if (typeof idArr === 'string') {
            return allTilesForEvent.find(tile => tile.id == idArr)
        } else {
            return idArr.map(id => allTilesForEvent.find(tile => tile.id == id))
        }
    })
    return tilesToSend
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
