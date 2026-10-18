import 'dotenv/config'
import pg from 'pg'
import apicalypse from 'apicalypse'
import { utcOneWeek, utcNow, utcToPGDate, delay, chunkList, sqlize, unsqlize } from './functionhider.js'
import { log } from '../server.js'

const Client = pg.Client

//i issued a new client secret cuz im braindead and uploaded the old one
const clientId = process.env.IGDB_CLIENT
const clientSecret = process.env.IGDB_SECRET
const igdbUrl = 'https://api.igdb.com/v4/'

let detailsFields = ''
detailsFields = detailsFields.concat('id,')
detailsFields = detailsFields.concat('name,')
detailsFields = detailsFields.concat('cover.image_id,')
detailsFields = detailsFields.concat('alternative_names.name,')
detailsFields = detailsFields.concat('alternative_names.comment,')
detailsFields = detailsFields.concat('platforms.name,')
detailsFields = detailsFields.concat('first_release_date,')
detailsFields = detailsFields.concat('release_dates.date,')
detailsFields = detailsFields.concat('release_dates.status,')
detailsFields = detailsFields.concat('release_dates.status.name,')
detailsFields = detailsFields.concat('hypes,')
detailsFields = detailsFields.concat('rating_count,')
detailsFields = detailsFields.concat('game_type,')
detailsFields = detailsFields.concat('game_status,')
detailsFields = detailsFields.concat('keywords,')
detailsFields = detailsFields.concat('parent_game,')
detailsFields = detailsFields.concat('involved_companies.company.name,')
detailsFields = detailsFields.concat('involved_companies.developer,')
detailsFields = detailsFields.concat('involved_companies.supporting,')
detailsFields = detailsFields.concat('involved_companies.porting,')
detailsFields = detailsFields.concat('involved_companies.publisher')

let popFields = ''
popFields = popFields.concat('game_id,')
popFields = popFields.concat('popularity_type.name,')
popFields = popFields.concat('value,')
popFields = popFields.concat('external_popularity_source.name')

let dbRows = ''
dbRows = dbRows.concat('id, ')
dbRows = dbRows.concat('igdb_cover_id, ')
dbRows = dbRows.concat('name, ')
dbRows = dbRows.concat('release_date, ')
dbRows = dbRows.concat('developers, ')
dbRows = dbRows.concat('publishers, ')
dbRows = dbRows.concat('notability_score, ')
dbRows = dbRows.concat('is_vr, ')
dbRows = dbRows.concat('is_remaster, ')
dbRows = dbRows.concat('is_in_early_access, ')
dbRows = dbRows.concat('is_released_from_early_access, ')
dbRows = dbRows.concat('is_expansion, ')
dbRows = dbRows.concat('is_mobile, ')
dbRows = dbRows.concat('is_free_to_play, ')
dbRows = dbRows.concat('alternative_names, ')
dbRows = dbRows.concat('last_update_date')

let dbUpdateRows = ''
dbUpdateRows = dbUpdateRows.concat('igdb_cover_id=ug.igdb_cover_id, ')
dbUpdateRows = dbUpdateRows.concat('name=ug.name, ')
dbUpdateRows = dbUpdateRows.concat('release_date=ug.release_date, ')
dbUpdateRows = dbUpdateRows.concat('developers=ug.developers, ')
dbUpdateRows = dbUpdateRows.concat('publishers=ug.publishers, ')
dbUpdateRows = dbUpdateRows.concat('notability_score=ug.notability_score, ')
dbUpdateRows = dbUpdateRows.concat('is_vr=ug.is_vr, ')
dbUpdateRows = dbUpdateRows.concat('is_remaster=ug.is_remaster, ')
dbUpdateRows = dbUpdateRows.concat('is_in_early_access=ug.is_in_early_access, ')
dbUpdateRows = dbUpdateRows.concat('is_released_from_early_access=ug.is_released_from_early_access, ')
dbUpdateRows = dbUpdateRows.concat('is_expansion=ug.is_expansion, ')
dbUpdateRows = dbUpdateRows.concat('is_mobile=ug.is_mobile, ')
dbUpdateRows = dbUpdateRows.concat('is_free_to_play=ug.is_free_to_play, ')
dbUpdateRows = dbUpdateRows.concat('alternative_names=ug.alternative_names, ')
dbUpdateRows = dbUpdateRows.concat('last_update_date=ug.last_update_date ')


let vrPlatformIds = [162, 163, 165, 384, 385, 386, 387, 388, 390, 471, 472]
let mobilePlatformIds = [34, 39]

// const url = 'https://api.igdb.com/v4/games/';
// const options = {
//   method: 'POST',
//   headers: {
//     accept: 'application/json',
//     'client-id': '27tqafcwp7di0gz90bs0mv91yq7q8c',
//     authorization: 'Bearer syz1sb2zj1fstuk909e3giaw3np2ox',
//     'content-type': 'text/plain'
//   },
//   body: 'fields *;\nwhere id = 313774;'
// };

export class UpdateStruct {
    updateGames = {}
    addGames = {}
    updateParents = {}
    addParents = {}
}

export class IGDBJob {
    db
    // authToken
    apiConfig
    gamesQueried = 0
    gamesUpdated = 0
    constructor() {
        try {
            this.db = new Client({
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                host: 'test-db',
                port: process.env.POSTGRES_PORT,
                database: "bingo-db"
            })
        } catch {
            // this.db = new Client({
            //     user: process.env.POSTGRES_USER,
            //     password: process.env.POSTGRES_PASSWORD,
            //     host: process.env.APP_POSTGRES_HOST,
            //     port: process.env.TEST_POSTGRES_IMAGE_PORT,
            //     database: "bingo-db"
            // })
        }

    }

    async connect() {
        await this.db.connect()
        console.log('connected')
        let res = await this.#runCmd('select now()')
        console.log(res.rows)
        log('IGDB // Job Started')
        // console.log('IGDB Job Started')
        // this.authToken = 
        this.apiConfig = {method: 'post', headers: await this.getAuthToken()}
    }

    async disconnect() {
        await this.db.end()
        log('IGDB // Job Ended')
        // console.log('games added: ' + this.gamesQueried)
        // console.log('games updated: ' + this.gamesUpdated)
    }

    /**
     * given a list of igdb game data, return a string that can be used to call MORE igdb data
     * @param {Array} igdbJsonList a list of objects that contain a igdb game id field called id
     * @returns a string that looks like this `id=1|id=2|...|id=50`
     */
    #apicalypseIdString(igdbJsonList, identifier='id', idName='id') {
        let apiString = ''
        for (let item of igdbJsonList) {
            apiString += `${identifier}=${item[idName]}|`
        }
        apiString = apiString.slice(0, -1) //remove trailing pipe
        return apiString
    }

    async #runCmd(cmd) {
        // console.log('SQL // ' + cmd)
        let res = await this.db.query(cmd)
        return res
    }

    // really should have written down who helped me build this, probably claude
    async #gameIdsExist(idList) {
        // let fullList = idLists.reduce((acc, val) => acc.concat(val))
        let cmd = `select new_games.id, (games.id is not null) as exists, games.notability_score from `
        cmd += `unnest(array[${idList}]::integer[]) as new_games(id)`
        cmd += `left join games using(id)`
        let existingRes = await this.#runCmd(cmd)
        return existingRes.rows
    }

    async getAuthToken() {
        let tokenCmd = `select * from igdb_api_keys`
        let tokenRes = await this.#runCmd(tokenCmd)
        let now = utcNow()
        if (tokenRes.rows.length == 0) {
            log('no igdb api token in db, adding one')
            let bearerInfo = await this.fetchBearer()
            let storeTokenCmd = `insert into igdb_api_keys (token, expires_at) values
                ('${bearerInfo.access_token}', ${bearerInfo.expiryTime});`
            await this.#runCmd(storeTokenCmd)
            tokenRes = await this.#runCmd(tokenCmd)
        }

        let token = tokenRes.rows[0]
        // console.log(token.expires_at)
        if (token.expires_at + (utcOneWeek * 4) > now) {
            // console.log('got token from db')
            //four weeks from now is less than now, token is valid
            return {
                accept: 'application/json',
                'content-type': 'text/plain',
                'client-id': clientId,
                'authorization': 'Bearer ' + token.token,
            }
        } else {
            log('refreshing igdb api token, will do so again in 4 weeks')
            let bearerJson = await this.fetchBearer(now)
            let updateTokenCmd = `update igdb_api_keys set
                token='${bearerJson.access_token}', expires_at=${bearerJson.expiryTime}
                where id=${token.id}`
            await this.#runCmd(updateTokenCmd)
            return {
                accept: 'application/json',
                'content-type': 'text/plain',
                'client-id': clientId,
                'authorization': 'Bearer ' + bearerJson.access_token,
            }
        }
    }

    async fetchBearer(now) {
        let credUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
        let authRes = await fetch(credUrl, {
            method: 'POST'
        })
        let authData = await authRes.json()
        // console.log(authData)
        let expiryTime = now + authData.expires_in
        return { access_token: authData.access_token, expiryTime: expiryTime}
    }

    async getSomeGames() {
        return [328373,151665,385294,305006,372560,388550,229093,280573,405028,342959]
    }

    /*
    fields 
        id,game,date;
    where 
        date > 1769628539 & date < 1770233339 & release_region = 8;
    sort
        date desc;
    limit
        500;*/
    async getGames(timeStart = null, timeEnd = null) {
        if (timeEnd == null) {
            timeEnd = utcNow()
        }
        if (timeStart == null) {
            timeStart = timeEnd - utcOneWeek
        }
        log('IGDB // searching for release items starting week of', utcToPGDate(timeStart))
        let offset = 0
        let fullGameList = []
        while (true) {
            let gamesRes = await apicalypse(this.apiConfig)
                .fields('game')
                .where(`date >= ${timeStart} & date < ${timeEnd} & release_region = 8`)  // worldwide region
                .sort('id desc')
                .offset(offset)
                .limit(500)
                .request('https://api.igdb.com/v4/release_dates/')
            await delay(1000)
            let gamesJson = gamesRes.data
            if (gamesJson.length == 0 || offset > 10_000) {
                break
            }
            fullGameList = fullGameList.concat(gamesJson)
            offset += 500
        }

        fullGameList = fullGameList.map(g => g.game)
        log(`IGDB // found ${fullGameList.length} release items to filter`)

        return fullGameList
    }

    async organizeGameDetails(gameList, doParents = true) {
        let detailsMap = {}
        let parentGamesToScan = [] // ids of games that were released sometime in the past, and are related to games that were released
            // dlc, seasons, and updates will not be in the database, but parent games will
        let compiledIGDBData = new UpdateStruct()

        // i love this command. for each game id in dbIdList, returns a map where
        //   key = id of game queried
        //   value = true if there is db entry with that id, otherwise false
        let listOfGamesInDatabase = await this.#gameIdsExist(gameList)
        let gamesToUpdate = listOfGamesInDatabase.filter(g => g.exists) // games in database
        let gamesToAdd = listOfGamesInDatabase.filter(g => !g.exists) // games missing

        log(`IGDB // Of the ${gameList.length} released items, there are ${gamesToUpdate.length} already in the database`)

        // console.log('games to update:')
        for (let chunk of chunkList(gamesToUpdate, 250)) {
            let idString = this.#apicalypseIdString(chunk)
            let detailsRes = await apicalypse(this.apiConfig)
                .fields(detailsFields)
                .where(idString)
                .sort('id','asc')
                .limit(500)
                .request('https://api.igdb.com/v4/games/')
            let detailsJson = detailsRes.data
            let reducedPopularity = await this.crunchPopularity(detailsJson)

            // turn the array into a searchable map.
            let compiledToUpdate = {}

            // apply the notability score based on igdb pre-release hype, igdb reviews, and pop score
            // for (let row of chunk) {
            // for (let game of detailsJson) {
            await detailsJson.forEach(async game => {
                if (game.hasOwnProperty('parent_game')) {
                    parentGamesToScan.push(game.parent_game)
                }

                this.normalizeData(game, reducedPopularity[game.id])
                if (game.notability_score > 5) {
                    // console.log('  ' + game.name +' -- score ' + game.notability_score)
                    compiledToUpdate[game.id] = game
                }
            })

            compiledIGDBData.updateGames = Object.assign(compiledIGDBData.updateGames, compiledToUpdate)
        }

        // console.log('games to add:')
        for (let chunk of chunkList(gamesToAdd, 100)) {
            let idString = this.#apicalypseIdString(chunk)
            // let apicalypsebody = `fields ${detailsFields};where ${idString};sort id asc;limit 500;`
            let detailsRes = await apicalypse(this.apiConfig)
                .fields(detailsFields)
                .where(idString)
                .sort('id','asc')
                .limit(500)
                .request('https://api.igdb.com/v4/games/')
            await delay(1000)
            // console.log(detailsRes)
            // 0 : main_game,            1 : dlc_addon, 2 : expansion,
            // 4 : standalone_expansion, 7 : season,    8 : remake,
            // 9 : remaster,             11: port,      14: update
            let okBaseGameTypes = [0, 2, 4, 8, 9, 11]
            let okSubGameTypes = [1, 7, 14]
            // let okGameTypes = [0,1,2,4,7,8,9,11,14]
            // 0        : released,     4: early access
            // undefined: only released
            let okGameStatus = [undefined, 0, 4]
            let parentCheck = detailsRes.data.filter(g => okSubGameTypes.includes(g.game_type))
            let baseGames = detailsRes.data
                .filter(g => okBaseGameTypes.includes(g.game_type))
                .filter(g => okGameStatus.includes(g.game_status))
            let reducedPopularity = await this.crunchPopularity(baseGames)
            let compiledToAdd = {}
            await baseGames.forEach(async game => {
                if (game.hasOwnProperty('parent_game')) {
                    parentGamesToScan.push(game.parent_game)
                }

                this.normalizeData(game, reducedPopularity[game.id])
                if (game.notability_score > 5) {
                    // console.log('  ' + game.name +' -- score ' + game.notability_score)
                    compiledToAdd[game.id] = game
                }
            })

            for (let sub of parentCheck) {
                if (sub.hasOwnProperty('parent_game')) {
                    parentGamesToScan.push(sub.parent_game)
                }
            }

            compiledIGDBData.addGames = Object.assign(compiledIGDBData.addGames, compiledToAdd)
        }
        // 0 2 4 8 9

        // for each game id in parentGameList, returns a map where
        //   key = id of game queried
        //   value = true if there is db entry with that id, otherwise false


        let allKeysAddingOrUpdating = Object.keys(compiledIGDBData.addGames).concat(Object.keys(compiledIGDBData.updateGames))
        let dbParentCheck = await this.#gameIdsExist(parentGamesToScan)
        let parentGamesToUpdate = dbParentCheck.filter(g => g.exists) // parent games in database
        let parentGamesToAdd = dbParentCheck.filter(g => !g.exists).filter(g =>
            !allKeysAddingOrUpdating.includes(String(g.id))
        ) // parent games missing, and not already going to be added in the new games
        log(`IGDB //`)
        let logMessage = `IGDB //  ${parentGamesToScan.length} parent games detected: ${parentGamesToAdd.length} to add, `
        logMessage = logMessage.concat(`${parentGamesToUpdate.length} to update, `)
        logMessage = logMessage.concat(`and ${parentGamesToScan.length - (parentGamesToAdd.length + parentGamesToUpdate.length)} already in the list of games to add`)
        log(logMessage)

        // console.log('parents to update:')
        for (let chunk of chunkList(parentGamesToUpdate, 100)) {
            let idString = this.#apicalypseIdString(chunk)
            let detailsRes = await apicalypse(this.apiConfig)
                .fields(detailsFields)
                .where(idString)
                .sort('id','asc')
                .limit(500)
                .request('https://api.igdb.com/v4/games/')
            await delay(1000)
            let detailsJson = detailsRes.data
            let reducedPopularity = await this.crunchPopularity(detailsJson)

            let compiledParentUpdate = {}
            await detailsJson.forEach(async game => {
                this.normalizeData(game, reducedPopularity[game.id])
                if (game.notability_score > 5) {
                    // console.log('  ' + game.name +' -- score ' + game.notability_score)
                    compiledParentUpdate[game.id] = game
                }
            })

            compiledIGDBData.updateParents = Object.assign(compiledIGDBData.updateParents, compiledParentUpdate)
        }

        // console.log('parents to add:')
        for (let chunk of chunkList(parentGamesToAdd, 100)) {
            let idString = this.#apicalypseIdString(chunk)
            let detailsRes = await apicalypse(this.apiConfig)
                .fields(detailsFields)
                .where(idString)
                .sort('id','asc')
                .limit(500)
                .request('https://api.igdb.com/v4/games/')
            await delay(1000)
            let detailsJson = detailsRes.data
            // 0 : main_game,            1 : dlc_addon, 2 : expansion,
            // 4 : standalone_expansion, 7 : season,    8 : remake,
            // 9 : remaster,             11: port,      14: update
            let okGameTypes = [0,1,2,4,7,8,9,11,14]
            // 0        : released,     4: early access
            // undefined: only released
            let okGameStatus = [undefined, 0, 4]
            detailsJson = detailsJson
                .filter(g => okGameTypes.includes(g.game_type))
                .filter(g => okGameStatus.includes(g.game_status))
            let reducedPopularity = await this.crunchPopularity(detailsJson)
            let compiledAddParents = {}
            await detailsJson.forEach(async game => {
                this.normalizeData(game, reducedPopularity[game.id])
                if (game.notability_score > 5) {
                    // console.log('  ' + game.name +' -- score ' + game.notability_score)
                    compiledAddParents[game.id] = game
                }
            })

            compiledIGDBData.addParents = Object.assign(compiledIGDBData.addParents, compiledAddParents)
        }

        return compiledIGDBData
    }

    normalizeData(game, popularity) {
        game.name = sqlize(game.name)

        game.notability_score = popularity
        if (game.hasOwnProperty('hypes')) {
            game.notability_score += game.hypes
        }
        if (game.hasOwnProperty('rating_count')) {
            game.notability_score += Math.floor(game.rating_count / 10)
        }
        if (game.notability_score == undefined) {
            game.notability_score = 0
        }

        if (game.keywords == undefined) {
            game.keywords = []
        }

        if (game.hasOwnProperty('cover')) {
            if (game.cover.image_id == undefined) {
                game.cover_id == ''
            } else {
                game.cover_id = game.cover.image_id
            }
        } else {
            game.cover_id = ""
        }

        // date normalizing
        game.first_release_date = utcToPGDate(game.first_release_date)

        //alternate title compilation
        if (game.hasOwnProperty('alternative_names')) {
            game.alternative_names = game.alternative_names.filter(altNameItem => {
                if (altNameItem.hasOwnProperty('comment')) {
                    let altComment = altNameItem.comment.toLowerCase()
                    return altComment == 'alternative title' || altComment == 'alternative spelling'
                }
            }).map(altNameItem => `'${sqlize(altNameItem.name)}'`)
        } else {
            game.alternative_names = []
        }

        if (game.hasOwnProperty('involved_companies')) {
            game.developers = game.involved_companies
                .filter(c => c.developer)
                .map(c => `'${sqlize(c.company.name)}'`)
            game.publishers = game.involved_companies
                .filter(c => c.publisher)
                .map(c => `'${sqlize(c.company.name)}'`)
        } else {
            game.developers = []
            game.publishers = []
        }

        if (game.hasOwnProperty('release_dates')) {
            let releaseIds = game.release_dates
                .filter(rd => rd.status)
                .map(rd => rd.status.id)
            game.containsEAAndFullRelease = [3,6].every(v => releaseIds.includes(v))
        } else {
            game.containsEAAndFullRelease = false
        }

        game.cover = {}
        game.release_dates = []
        game.involved_companies = []
    }

    async updateGamesTable(compiledStruct) {
        let addGameCount = Object.keys(compiledStruct.addGames).length
        let updateGameCount = Object.keys(compiledStruct.updateGames).length
        let addParentCount = Object.keys(compiledStruct.addParents).length
        let updateParentCount = Object.keys(compiledStruct.updateParents).length
        log(`IGDB // ${addGameCount} games and ${addParentCount} parents meet the criteria to be added`)
        log(`IGDB // ${updateGameCount} games and ${updateParentCount} parents will be updated`)

        let now = utcToPGDate(utcNow())
        let dbStr = ''
        if (addGameCount > 0) {
            // console.log(`attempting to add ${addGameCount} new games`)
            //new games
            dbStr = dbStr.concat('insert into games (', dbRows, ') values ')
            Object.values(compiledStruct.addGames).forEach(game => {
                dbStr = dbStr.concat(this.getDbStringForGame(game, now))
            })
            dbStr = dbStr.slice(0, -1) // remove trailing comma
            dbStr = dbStr.concat(';')
            // console.log('new games:')
            // console.log(dbStr)
            this.#runCmd(dbStr)
            await delay(3000)
        }

        //new parents
        if (addParentCount > 0) {
            // console.log(`attempting to add ${addParentCount} new parents`)
            dbStr = ''
            dbStr = dbStr.concat('insert into games (', dbRows, ') values ')
            Object.values(compiledStruct.addParents).forEach(game => {
                dbStr = dbStr.concat(this.getDbStringForGame(game, now))
            })
            dbStr = dbStr.slice(0, -1)
            dbStr = dbStr.concat(';')
            // console.log('new parents:')
            // console.log(dbStr)
            this.#runCmd(dbStr)
            await delay(3000)
        }

        //update games
        dbStr = ''
        if (updateGameCount > 0) {
            // console.log(`attempting to update ${updateGameCount} existing games`)
            dbStr = dbStr.concat('update games as g set ', dbUpdateRows, ' from (values')
            Object.values(compiledStruct.updateGames).forEach(game => {
                dbStr = dbStr.concat(this.getDbStringForGame(game, now))
            })
            dbStr = dbStr.slice(0, -1)
            dbStr = dbStr.concat(`) as ug(${dbRows}) where ug.id = g.id;`)
            // dbStr = dbStr.concat(') as ug(id, igdb_cover_id, name, release_date, developers, publishers, notability_score, is_vr,',
            //     'is_remaster, is_in_early_access, is_released_from_early_access, is_expansion, is_mobile, is_free_to_play,',
            //     'alternative_names, last_update_date) ')
            // dbStr = dbStr.concat('')
            // console.log('update games:')
            // console.log(dbStr)
            this.#runCmd(dbStr)
            await delay(3000)
        }

        //update parents
        dbStr = ''
        if (updateParentCount > 0) {
            // console.log(`attempting to update ${updateParentCount} existing parents`)
            dbStr = dbStr.concat(`update games as g set ${dbUpdateRows} from (values `)
            // dbStr = dbStr.concat('igdb_cover_id=ug.igdb_cover_id, ')
            // dbStr = dbStr.concat('name=ug.name, ')
            // dbStr = dbStr.concat('release_date=ug.release_date, ')
            // dbStr = dbStr.concat('developers=ug.developers, ')
            // dbStr = dbStr.concat('publishers=ug.publishers, ')
            // dbStr = dbStr.concat('notability_score=ug.notability_score, ')
            // dbStr = dbStr.concat('is_vr=ug.is_vr, ')
            // dbStr = dbStr.concat('is_remaster=ug.is_remaster, ')
            // dbStr = dbStr.concat('is_in_early_access=ug.is_in_early_access, ')
            // dbStr = dbStr.concat('is_released_from_early_access=ug.is_released_from_early_access, ')
            // dbStr = dbStr.concat('is_expansion=ug.is_expansion, ')
            // dbStr = dbStr.concat('is_mobile=ug.is_mobile, ')
            // dbStr = dbStr.concat('is_free_to_play=ug.is_free_to_play, ')
            // dbStr = dbStr.concat('alternative_names=ug.alternative_names, ')
            // dbStr = dbStr.concat('last_update_date=ug.last_update_date ')
            // dbStr = dbStr.concat('from (values ')
            Object.values(compiledStruct.updateParents).forEach(game => {
                dbStr = dbStr.concat(this.getDbStringForGame(game, now))
            })
            dbStr = dbStr.slice(0, -1)
            dbStr = dbStr.concat('\n')
            dbStr = dbStr.concat(`) as ug (${dbRows}) `)
            // dbStr = dbStr.concat(') as ug(id, igdb_cover_id, release_date, developers, publishers, notability_score, is_vr,',
            //     'is_in_early_access, is_released_from_early_access, is_expansion, is_mobile, is_free_to_play,',
            //     'alternative_names, last_update_date) ')
            dbStr = dbStr.concat('where ug.idid = g.id;')
            // console.log('update parents:')
            // console.log(dbStr)
            this.#runCmd(dbStr)
        }
    }

    getDbStringForGame(game, now) {
        let retVal = '\n'
        retVal = retVal.concat('(')
        retVal = retVal.concat(game.id, ',')
        retVal = retVal.concat(`'${game.cover_id}'`, ',')
        retVal = retVal.concat(`'${game.name}'`, ',')
        retVal = retVal.concat(`'${game.first_release_date}'`, ',')
        retVal = retVal.concat(`array[${game.developers}]::text[]`, ',') // might need `array[${game.developers}]`
        retVal = retVal.concat(`array[${game.publishers}]::text[]`, ',') // might need `array[${game.publishers}]`
        retVal = retVal.concat(game.notability_score, ',')
        retVal = retVal.concat(game.platforms.map(p => p.id).some(p => vrPlatformIds.includes(p)), ',') // vr?
        retVal = retVal.concat(game.game_type.id == 9, ',') // remaster?
        retVal = retVal.concat(game.game_status == 4, ',') // early access?
        retVal = retVal.concat(game.containsEAAndFullRelease, ',') // came from early access?
        retVal = retVal.concat(game.game_type == 2 || game.game_type == 4, ',') //is an expansion?
        retVal = retVal.concat(game.platforms.map(p => p.id).some(p => mobilePlatformIds.includes(p)), ',') //is mobile?
        retVal = retVal.concat(game.keywords.includes(2385), ',') //is free to play?
        retVal = retVal.concat(`array[${game.alternative_names}]::text[]`, ',') // might need `array[${game.alternative_names}]`
        retVal = retVal.concat(`'${now}'`) // last updated
        retVal = retVal.concat('),')
        return retVal
    }

    /**
     * for a list of igdb game data, find all the popularity sources for this game.
     * tally a score, for each non-igdb popularity source, score 2 points
     * @param {Array} gameList (nearly) raw list of igdb game details data minimally containing field:id
     * @returns {Object} a map like object where the key is the game id, and the value is its score
     */
    async crunchPopularity(gameList) {
        if (gameList.length > 199) {
            return
        }
        let reduced = {}
        let popIdList = this.#apicalypseIdString(gameList, 'game_id')
        // console.log(popFields)
        // console.log(popIdList)
        let popRes = await apicalypse(this.apiConfig)
            .fields(popFields)
            .where(popIdList)
            .sort('game_id','asc')
            .limit(500)
            .request('https://api.igdb.com/v4/popularity_primitives/')
        await delay(1000)
        let popJson = popRes.data
        for (let pr of popJson) {
            if (reduced[pr.game_id] == undefined) {
                reduced[pr.game_id] = 0
            }
            if (pr.external_popularity_source.name == 'IGDB') {
                continue
            }

            reduced[pr.game_id] += 2
        }

        return reduced
    }

    async getGamePopularity(idBall) {
        let popIdList = ''
        for (id of idBall) {
            popIdList += 'id=' + id + '|'
        }
        popIdList = popIdList.slice(0, -1)
        let popFields = ''
        popFields += 'game_id,'
        popFields += 'popularity_type.name,'
        popFields += 'value,'
        popFields += 'external_popularity_source.name'
        let popRes = await apicalypse(this.apiConfig)
            .fields(popFields)
            .where(popIdList)
            .sort('game_id','asc')
            .limit(500)
            .request('https://api.igdb.com/v4/popularity_primitives/')
        await delay(1000)
        let popJson = await popRes.json()
        let reduced = []
        for (pr of popJson) {
            if (reduced[pr.game_id] == undefined) {
                reduced[pr.game_id] = 0
            }
            reduced[pr.game_id] += 2
        }
        return reduced
    }
}
