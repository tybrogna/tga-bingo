import 'dotenv/config'
import pg from 'pg'
import apicalypse from 'apicalypse'
import { utcOneWeek, utcNow, delay, chunkList,  } from './functionhider.js'

const Client = pg.Client

//i issued a new client secret cuz im braindead and uploaded the old one
const clientId = process.env.IGDB_CLIENT
const clientSecret = process.env.IGDB_SECRET
const igdbUrl = 'https://api.igdb.com/v4/'

let detailsFields = ''
detailsFields += 'id,'
detailsFields += 'name,'
detailsFields += 'cover,'
detailsFields += 'platforms.name,'
detailsFields += 'first_release_date,'
detailsFields += 'release_dates.release_region'
detailsFields += 'release_dates.date'
detailsFields += 'hypes,'
detailsFields += 'rating_count'
detailsFields += 'game_type,'
detailsFields += 'game_status,'
detailsFields += 'keywords,'
detailsFields += 'parent_game,'
detailsFields += 'involved_companies.company.name,'
detailsFields += 'involved_companies.developer,'
detailsFields += 'involved_companies.supporting,'
detailsFields += 'involved_companies.porting,'
detailsFields += 'involved_companies.publisher'

let popFields = ''
popFields += 'game_id,'
popFields += 'popularity_type.name,'
popFields += 'value,'
popFields += 'external_popularity_source.name'



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
    authToken
    gamesQueried = 0
    gamesUpdated = 0
    constructor() {
        try {
            this.db = new Client({
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                host: process.env.APP_POSTGRES_HOST,
                port: process.env.POSTGRES_IMAGE_PORT,
                database: "bingo-db"
            })
        } catch {
            this.db = new Client({
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                host: process.env.APP_POSTGRES_HOST,
                port: process.env.TEST_POSTGRES_IMAGE_PORT,
                database: "bingo-db"
            })
        }

    }

    async connect() {
        console.log('trying to connect')
        await this.db.connect()
        console.log('connected')
        let res = await this.#runCmd('select now()')
        console.log(res.rows)
        console.log('IGDB Job Started')
        this.authToken = await this.getAuthToken()
    }

    async disconnect() {
        await this.db.end()
        console.log('IGDB Job Ended')
        console.log('games added: ' + this.gamesQueried)
        console.log('games updated: ' + this.gamesUpdated)
    }

    /**
     * given a list of igdb game data, return a string that can be used to call MORE igdb data
     * @param {Array} igdbJsonList a list of objects that contain a igdb game id field called id
     * @returns a string that looks like this `id=1|id=2|...|id=50`
     */
    #apicalypseIdString(igdbJsonList, idName='id') {
        let apiString = ''
        for (let item of jsonList) {
            apiString += `id=${game[idName]}|`
        }
        apiString = apiString.slice(0, -1) //remove trailing pipe
        return apiString
    }

    async #runCmd(cmd) {
        console.log(cmd)
        let res = await this.db.query(cmd)
        return res
    }

    // really should have written down who helped me build this, probably claude
    async #gameIdsExist(idLists) {
        let fullList = idLists.reduce((acc, val) => acc.concat(val))
        let cmd = `select new_games.id, (games.id is not null) as exists, games.notability_score from `
        cmd += `unnest(array[${fullList}]) as new_games(id)`
        cmd += `left join games using(id)`
        let existingRes = await this.#runCmd(cmd)
        return existingRes
    }

    async getAuthToken() {
        let tokenCmd = `select * from igdb_api_keys`
        let tokenRes = await this.#runCmd(tokenCmd)
        let now = utcNow()
        if (tokenRes.rows.length == 0) {
            console.log('no token in db, adding one')
            let bearerInfo = await this.fetchBearer()
            let storeTokenCmd = `insert into igdb_api_keys
                (token, expires_at) values
                ('${bearerInfo.access_token}', ${bearerInfo.expiryTime});`
            await this.#runCmd(storeTokenCmd)
            tokenRes = await this.#runCmd(tokenCmd)
        }

        let token = tokenRes.rows[0]
        console.log(token.expires_at)
        if (token.expires_at + (utcOneWeek * 4) > now) {
            console.log('got token from db')
            //four weeks from now is less than now, token is valid
            return {
                accept: 'application/json',
                'content-type': 'text/plain',
                'client-id': clientId,
                'authorization': 'Bearer ' + token.token,
            }
        } else {
            console.log('refreshing token, will do so again in 4 weeks')
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
        console.log(authData)
        let expiryTime = now + authData.expires_in
        return { access_token: authData.access_token, expiryTime: expiryTime}
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
        let offset = 0
        let fullGameList = []
        while (offset != 0 && offset % 500 == 0) {
            let gamesRes = await apicalypse({headers: this.authToken})
                .fields('id, game, date')
                .where(`date >= ${timeStart}`)
                .where(`date <= ${timeEnd}`)
                .where('release_region = 8')  // worldwide region
                .sort('id', 'desc')
                .offset(offset)
                .limit(500)
                .request(igdbUrl + 'release_dates')
            await delay(1000)
            let gamesJson = await gamesRes.json()
            if (gamesJson.length == 0) { break }
            fullGameList = fullGameList.concat(gamesJson)
            offset += gamesJson.length
        }

        // let igdbBody = 
        //     `fields id, game, date;
        //     date > ${timeStart} & date < ${timeEnd} & release_region = 8;
        //     sort date desc;
        //     limit 500;` //500 is the max
        // igdbBody = igdbBody.replace('\n', '')
        // let gamesRes = await fetch('https://api.igdb.com/v4/release_dates/', {
        //     method: 'post',
        //     headers: this.authToken,
        //     body: igdbBody
        // })

        return fullGameList
    }

    async getGameDetails(gameList) {
        let detailsMap = {}
        // let parentGamesToScan = {}
        let parentGamesToScan = [] // ids of games that were released sometime in the past, and are related to games that were released
            // dlc, seasons, and updates will not be in the database, but parent games will
        let unhypedIds = [] // list of games that didnt have pre-release hype, need their popularity checked
        let queryIdLists = []  // array of objects that look like this "id=1|2|3" for api use
        let dbIdList = gameList.map(game => game.id)  // to send to db as a int array
        let compiledIGDBData = UpdateStruct()

        // i love this command. for each game id in dbIdList, returns a map where
        //   key = id of game queried
        //   value = true if there is db entry with that id, otherwise false
        let listOfGamesInDatabase = await this.#gameIdsExist(dbIdList)
        let gamesToUpdate = listOfGamesInDatabase.filter((k,v) => v == true) // games in database
        let gamesToAdd = listOfGamesInDatabase.filter((k,v) => v == false) // games missing

        for (let chunk of chunkList(gamesToUpdate, 100)) {
            let idString = this.#apicalypseIdString(chunk)
            let detailsRes = await apicalypse({headers: this.authToken})
                .fields(detailsFields)
                .where(idList)
                .sort('id','asc')
                .limit(500)
            let detailsJson = await detailsRes.json()
            let reducedPopularity = await crunchPopularity(detailsJson)

            // turn the array into a searchable map.
            let compiledToUpdate = {}
            for (let item of detailsJson) {
                compiledToUpdate[item.id] = item
            }

            // apply the notability score based on igdb pre-release hype, igdb reviews, and pop score
            for (let row of chunk) {
                // notability compilation
                let game = compiledToUpdate[row.id]
                let newNotability = reducedPopularity[game.id]
                if (game.hasOwnProperty('hypes')) {
                    newNotability += game.hypes
                }
                if (game.hasOwnProperty('rating_count')) {
                    newNotability += Math.floor(game.rating_count / 10)
                }
                if (row.notability_score <= newNotability) {
                    game.notability = newNotability
                }

                //alternate title compilation
                if (game.hasOwnProperty('alternative_names')) {
                    game.alternative_names = game.alternative_names.filter(altNameItem => {
                        if (altNameItem.hasOwnProperty('comment')) {
                            let altComment = altNameItem.comment.toLowerCase()
                            return altComment == 'alternative title' || altComment == 'alternative spelling'
                        }
                    }).map(altNameItem => altNameItem.name)
                }
            }

            compiledIGDBData.updateGames = Object.assign(compiledIGDBData.updateGames, compiledToUpdate)
        }

        for (let chunk of chunkList(gamesToAdd, 100)) {
            let idString = this.#apicalypseIdString(chunk)
            let detailsRes = await apicalypse({headers: this.authToken})
                .fields(detailsFields)
                .where(idList)
                .sort('id','asc')
                .limit(500)
            await delay(1000)
            let detailsJson = await detailsRes.json()
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
            let reducedPopularity = await crunchPopularity(detailsJson)
            let compiledToAdd = {}
            for (let item of detailsJson) {
                compiledToAdd[item.id] = item
            }

            for (let row of chunk) {
                let game = compiledToAdd[row.id]
                if (game.hasOwnProperty(parent_game)) {
                    parentGamesToScan.push(detailsMap[item.id].parent_game)
                }
                game.notability = reducedPopularity[game.id]
                if (game.hasOwnProperty('hypes')) {
                    game.notability += game.hypes
                }
                if (game.hasOwnProperty('rating_count')) {
                    game.notability += Math.floor(game.rating_count / 10)
                }
            }

            compiledIGDBData.addGames = Object.assign(compiledIGDBData.addGames, compiledToAdd)
        }

        // for each game id in parentGameList, returns a map where
        //   key = id of game queried
        //   value = true if there is db entry with that id, otherwise false
        let dbParentCheck = await this.#gameIdsExist(parentGamesToScan)
        let parentGamesToUpdate = dbParentCheck.filter((k,v) => v == true) // parent games in database
        let parentGamesToAdd = dbParentCheck.filter((k,v) => v == false) // parent games missing

        for (let chunk of chunkList(parentGamesToUpdate, 100)) {
            let idString = this.#apicalypseIdString(chunk)
            let detailsRes = await apicalypse({headers: this.authToken})
                .fields(detailsFields)
                .where(idList)
                .sort('id','asc')
                .limit(500)
            let detailsJson = await detailsRes.json()
            let reducedPopularity = await crunchPopularity(detailsJson)

            let compiledParentUpdate = {}
            for (let item of detailsJson) {
                compiledParentUpdate[item.id] = item
            }

            for (let row of chunk) {
                let game = compiledParentUpdate[row.id]
                let newNotability = reducedPopularity[game.id]
                if (game.hasOwnProperty('hypes')) {
                    newNotability += game.hypes
                }
                if (game.hasOwnProperty('rating_count')) {
                    newNotability += Math.floor(game.rating_count / 10)
                }
                if (row.notability_score <= newNotability) {
                    game.notability = newNotability
                }
            }

            compiledIGDBData.updateParents = Object.assign(compiledIGDBData.updateParents, compiledParentUpdate)
        }

        for (let chunk of chunkList(parentGamesToAdd, 100)) {
            let idString = this.#apicalypseIdString(chunk)
            let detailsRes = await apicalypse({headers: this.authToken})
                .fields(detailsFields)
                .where(idList)
                .sort('id','asc')
                .limit(500)
            await delay(1000)
            let detailsJson = await detailsRes.json()
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
            let reducedPopularity = await crunchPopularity(detailsJson)
            let compiledToAdd = {}
            for (let item of detailsJson) {
                compiledToAdd[item.id] = item
            }

            for (let row of chunk) {
                let game = compiledToAdd[row.id]
                if (game.hasOwnProperty(parent_game)) {
                    parentGamesToScan.push(detailsMap[item.id].parent_game)
                }
                game.notability = reducedPopularity[game.id]
                if (game.hasOwnProperty('hypes')) {
                    game.notability += game.hypes
                }
                if (game.hasOwnProperty('rating_count')) {
                    game.notability += Math.floor(game.rating_count / 10)
                }
            }

            compiledIGDBData.addParents = Object.assign(compiledIGDBData.addParents, compiledToAdd)
        }

        return compiledIGDBData

        // ------------------

        // let dbParentCheck = await this.#gameIdsExist(parentGamesToScan)
        // let parentGamesToUpdate = dbParentCheck.filter((k,v) => v == true) // parent games in database
        // let parentGamesToAdd = dbParentCheck.filter((k,v) => v == false) // parent games missing

        // for each parent game in database, update it
        // for (let chunk of chunkList(parentGamesToUpdate, 100)) {
        //     let idString = this.#apicalypseIdString(chunk)
        //     let parentUpdateDetailsRes = await apicalypse({headers: this.authToken})
        //         .fields(detailsFields)
        //         .where(shortIdsStr)
        //         .sort('id','asc')
        //         .limit(500)
        //     await delay(1000)
        //     let parentUpdateDetailsJson = await parentUpdateDetailsRes.json()
            // TODO update games already in database
        // }

        // for each parent game missing, add it
        // for (let chunk of chunkList(parentGamesToAdd)) {
        //     let idString = this.#apicalypseIdString(chunk)
        //     let parentAddDetailsRes = await apicalypse({headers: this.authToken})
        //         .fields(detailsFields)
        //         .where(shortIdsStr)
        //         .sort('id','asc')
        //         .limit(500)
        //     await delay(1000)
        //     let parentAddDetailsJson = await parentAddDetailsRes.json()
            // TODO add games to database
        // }

        // return []

        // return detailsJson
    }

    // async reducePopularityResponse(popRes) {
    //     let reduced = []
    //     for (pr of popRes) {
    //         if (reduced[pr.game_id] == undefined) {
    //             reduced[pr.game_id] = 0
    //         }
    //         reduced[pr.game_id] += 2
    //     }
    //     return reduced
    // }

    async updateGamesTables(compiledStruct) {
        let addStr = ''
        Object.values(compiledStruct.addGames).forEach(game => {
            addStr.concat('(')
            
            addStr.concat(')')
        })
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
        let idList = this.#apicalypseIdString(gameList)
        let popRes = await apicalypse({headers: this.authToken})
            .fields(popFields)
            .where(popIdList)
            .sort('game_id','asc')
            .limit(500)
        await delay(1000)
        let popJson = await popRes.json()
        for (pr of popJson) {
            if (reduced[pr.game_id] == undefined) {
                reduced[pr.game_id] = 0
            }
            if (pr.external_popularity_source.name != 'IGDB') {
                reduced[pr.game_id] += 2
            }
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
        let popRes = await apicalypse({headers: this.authToken})
            .fields(popFields)
            .where(popIdList)
            .sort('game_id','asc')
            .limit(500)
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

        // let popularityMap = this.calculatePopularites(popJson)
        // return popJson
    }

    // calculatePopularites(popularityBall) {
    //     let gameScoreMap = {}
    //     for (item of popularityBall) {
    //         if (gameScoreMap[item.game_id] == undefined) {
    //             gameScoreMap[item.game_id] = 0
    //         }
    //         if (item.external_popularity_source.name == 'IGDB') {
    //             gameScoreMap[item.game_id] += 1
    //         } else {
    //             gameScoreMap[item.game_id] += 2
    //         }
    //     }

    //     return gameScoreMap
    }

    async organizeGameDetails(gameDetailsList) {
        let dbCmds = []
        let igdbIds = gameDetailsList.map(g => g.id)
        // select * from games where igdb_id in (${gameIds}) order by igdb_id;
        // let 
        // filter updated ids from gameDetailsList
        for (gameDetails of gameDetailsList) {
            let id = gameDetails.id
            let igdb_cover_id = gameDetails.cover
            let name = gameDetails.name
            let release = gameDetails.first_release_date
            let developers = gameDetails.involved_companies
                .filter(c => c.developer || c.porting)
                .map(c => c.company.name)
                .sort()
                .toString()
            // insert into games
            //   (igdb_id, igdb_cover_id, name,
            //    release, developer,     publisher)
            // values
            //   ()
        }
    }
}
