import express from 'express'
import cors from 'cors'
import http from 'http'
import https from 'https'
import fs from 'fs'
import multer from 'multer'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { CronJob } from 'cron'

import { getPRNG, shuffle } from './js/randomHelper.js'
import Database from './js/database.js'
import { IGDBJob } from './js/igdb.js'
import { theseExist, colinHacksEmailRegex, utcNow, utcOneWeek } from './js/functionhider.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const job = new CronJob('0 0 * * 1,4',

)


export function log(message) {
    console.log(message)
    message = new Date().toLocaleString({timeZone: 'est'}).concat(' ', message).concat('\n')
    fs.appendFile('log.txt', message, (err) => { if (err) { throw err } })
}

let app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('dist'))
app.use(express.static('../uploads'))

app.get('/helloworld', async (req, res) => {
    console.log("HELLO WORLD")
    res.send({"hw":"HELLO WORLD"})
})

let db = new Database()
await db.connect()
process.on('exit', async () => {
    await db.disconnect()
})

app.get('/testcron', async (req, res) => {
    console.log('testing server cron job')
    job.start()
    res.send('started')
})

app.get('/igdb/games/search/:term?', async (req, res) => {
    res.json(await db.getGames(req.params.term))
})

app.get('/igdb/games/id/:list?', async (req, res) => {
    res.json(await db.getGamesByIds(req.params.list))
})

app.get('/nomineeCategories/:id?', async (req, res) => {
    res.json(await db.getUserNominations(req.params.id))
})

app.post('/saveNominees', async (req,res) => {
    await db.saveUserNominations(req.body)
})

app.get('/dbAccess/:token/getTables', async (req, res) => {
    let rightNow = Date.now()
    let oneWeek = 60*60*24*7*1000
    let pass = process.env.DB_VIEW_PASSWORD + (rightNow - (rightNow % oneWeek) + oneWeek).toString()
    // let salt = bcrypt.genSaltSync(10)
    // let hash = bcrypt.hashSync(pass, salt)
    if (!bcrypt.compareSync(pass, req.params.token)) {
        console.log("unauthorized")
        res.send('no')
        return
    }

    res.send(await db.getTables())
})

app.get('/dbAccess/:token/get100Rows/:tableName/:offset', async (req, res) => {
    let rightNow = Date.now()
    let oneWeek = 60*60*24*7*1000
    let pass = process.env.DB_VIEW_PASSWORD + (rightNow - (rightNow % oneWeek) + oneWeek).toString()
    // let salt = bcrypt.genSaltSync(10)
    // let hash = bcrypt.hashSync(pass, salt)
    console.log(req.params.token)
    if (!bcrypt.compareSync(pass, req.params.token)) {
        console.log("unauthorized")
        res.send('no')
        return
    }

    if (req.params.tableName == "users") {
        res.send('no')
        return
    } else {
        res.send(await db.getRows(req.params.tableName, req.params.offset))
    }
})

app.get('/dbAccess/:password', async (req, res) => {
    console.log(req.params.password)
    if (req.params.password == process.env.DB_VIEW_PASSWORD) {
        console.log("its correct")
        let rightNow = Date.now()
        let oneWeek = 60*60*24*7*1000
        let pass = req.params.password + (rightNow - (rightNow % oneWeek) + oneWeek).toString()
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(pass, salt)

        res.send({token: hash, expiresAt: (rightNow - (rightNow % oneWeek) + oneWeek)})
        return
    }
    console.log("its wrong")
})

app.get('/miniDb', async (req, res) => {
    let igdb = new IGDBJob()
    await igdb.connect()
    let oneWeekOfGames = await igdb.getGames(1762732800, 1763337600)
    // let someGames = await igdb.getSomeGames()
    let deets = await igdb.organizeGameDetails(oneWeekOfGames)
    igdb.updateGamesTable(deets)
    res.send('hi')
})

app.get('/maxDb', async (req, res) => {
    updateDBWithThisWeeksGames()
})

async function initIGDB() {
    let utcOrigin = 1761955200 // 1 Nov 2026 00:00
    let now = utcNow()
    while (utcOrigin < now) {
        let nextWeek = utcOrigin + utcOneWeek
        let igdb = new IGDBJob()
        igdb.connnect()
        let thisWeeksGames = await igdb.getGames(utcOrigin, nextWeek)
        let compiledGames = await igdb.organizeGameDetails(thisWeeksGames)
        igdb.updateGamesTable(compiledGames)
        igdb.disconnect()
        await delay(10000)
    }
}

async function updateDBWithThisWeeksGames() {
    let now = utcNow()
    let lastWeek = now - utcOneWeek
    let secondWeek = lastWeek - utcOneWeek
    let thirdWeek = secondWeek - utcOneWeek
    let fourthWeek = thirdWeek - utcOneWeek
    let rawWeeklyGames, compiledGames
    let igdb = new IGDBJob()
    await igdb.connect()

    rawWeeklyGames = await igdb.getGames(lastWeek, now)
    compiledGames = await igdb.organizeGameDetails(rawWeeklyGames)
    await igdb.updateGamesTable(compiledGames)

    rawWeeklyGames = await igdb.getGames(secondWeek, lastWeek)
    compiledGames = await igdb.organizeGameDetails(rawWeeklyGames)
    await igdb.updateGamesTable(compiledGames)

    rawWeeklyGames = await igdb.getGames(thirdWeek, secondWeek)
    compiledGames = await igdb.organizeGameDetails(rawWeeklyGames)
    await igdb.updateGamesTable(compiledGames)

    rawWeeklyGames = await igdb.getGames(fourthWeek, thirdWeek)
    compiledGames = await igdb.organizeGameDetails(rawWeeklyGames)
    await igdb.updateGamesTable(compiledGames)

    igdb.disconnect()
}

app.post('/registerUser', async (req, res) => {
    let email = req.body.email
    let username = req.body.username
    let password = req.body.password
    if (!theseExist(email, username, password)) {
        console.log('data missing')
        res.json({ error: 'data missing'})
        return
    }

    if (!colinHacksEmailRegex(email)) {
        console.log(`${email} failed email regex`)
        res.json({ error: `${email} failed email regex`})
        return
    }

    let isUser = await db.retrieveUser(email)
    if (isUser) {
        res.json({ error: `${email} already in use`})
        return
    }

    try {
        let hashedPass = await bcrypt.hash(password, 10)
        let dbUser = await db.createUser(email, username, hashedPass)
        let token = jwt.sign({id: dbUser.id}, process.env.JWT_SECRET, {expiresIn: '8h'})
        res.json({ token: token, id: dbUser.id, username: dbUser.username })
    } catch(err) {
        console.log(err)
        res.json({ error: err })
    }
})

app.post('/login', async (req, res) => {
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
            let token = jwt.sign({id: dbUser.id}, process.env.JWT_SECRET, {expiresIn: '8h'})
            res.json({ token: token, id: dbUser.id, username: dbUser.username })
        } else {
            res.json({ error: "Password incorrect" })
        }
    } catch(err) {
        console.log(err)
        res.json({ error: err })
    }
})

app.post('/verifyTokenActive', async (req, res) => {
    let guy = jwt.verify(req.body.token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            if (err.message.includes('expired')) {
                console.log(req.body.username + ' expired')
                res.send(false)
            }
        } else {
            console.log(req.body.username + ' token ok')
            res.send(true)
        }
    })
})

app.post('/submitNomineesGuesses', async (req, res) => {

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
// app.get('*', async (req, res) => {
//     res.sendFile('./dist/index.html', {root: __dirname})
// })

const [server, port] = (() => {
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



server.listen(port, (err) => {
    if (!err) {
        log('server online')
        console.log('its on at ' + port)
    }
})
