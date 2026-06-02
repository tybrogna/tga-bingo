import 'dotenv/config'
import pg from 'pg'
import apicalypse from 'apicalypse'
import { utcOneWeek, utcNow, delay, chunkList } from './functionhider.js'

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
detailsFields += 'game_type,'
detailsFields += 'game_status,'
detailsFields += 'keywords,'
detailsFields += 'parent_game,'
detailsFields += 'involved_companies.company.name,'
detailsFields += 'involved_companies.developer,'
detailsFields += 'involved_companies.supporting,'
detailsFields += 'involved_companies.porting,'
detailsFields += 'involved_companies.publisher'


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

    async #runCmd(cmd) {
        console.log(cmd)
        let res = await this.db.query(cmd)
        return res
    }

    async #gameIdsExist(idLists) {
        let fullList = idLists.reduce((acc, val) => acc.concat(val))
        let cmd = `select new_games.id, (games.id is not null) as exists from `
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
        // let detailsFields = ''
        // detailsFields += 'id,'
        // detailsFields += 'name,'
        // detailsFields += 'cover,'
        // detailsFields += 'platforms.name,'
        // detailsFields += 'first_release_date,'
        // detailsFields += 'release_dates.release_region'
        // detailsFields += 'release_dates.date'
        // detailsFields += 'hypes,'
        // detailsFields += 'game_type,'
        // detailsFields += 'game_status,'
        // detailsFields += 'keywords,'
        // detailsFields += 'parent_game,'
        // detailsFields += 'involved_companies.company.name,'
        // detailsFields += 'involved_companies.developer,'
        // detailsFields += 'involved_companies.supporting,'
        // detailsFields += 'involved_companies.porting,'
        // detailsFields += 'involved_companies.publisher'

        let queryIdLists = []  // array of objects that look like this "id=1|2|3" for api use
        let dbIdList = []  //to send to db as a int array
        for (gameChunk of chunkList(gameList, 100)) {
            let shortIdsList = ''
            for (game of gameChunk) {
                shortIdsList += `id=${game.id}|`
                dbIdList.push(game.id)
            }
            shortIdsList = shortIdsList.slice(0, -1)  //remove trailing pipe
            queryIdLists.push(shortIdsList)
        }

        for (idList of queryIdLists) {
            let detailsRes = await apicalypse({headers: this.authToken})
                .fields(detailsFields)
                .where(idList)
                .sort('id','asc')
                .limit(500)
            await delay(1000)
            let detailsJson = await detailsRes.json()
            // 0: main_game, 2: expansion, 4 : standalone_expansion, 7 : season,
            // 8: remake,    9: remaster,  11: port,                 14: update
            let okGameTypes = [0,2,4,7,8,9,11,14]
            // 0        : released,     4: early access
            // undefined: only released
            let okGameStatus = [undefined, 0, 4]
            detailsJson = detailsJson
                .filter(g => okGameTypes.includes(g.game_type))
                .filter(g => okGameStatus.includes(g.game_status))

            // transform game list into a dictionary with id as a key
            // but exclude all games already in the database
            let detailsMap = {}
            let listOfGamesInDatabase = await this.#gameIdsExist(dbIdList)
            for (let item of detailsJson) {
                let alreadyInDatabase = listOfGamesInDatabase[item.id]
                if (!alreadyInDatabase) {
                    detailsMap[item.id] = item
                }
            }
            detailsJson = []  //save memory, untrack array
            
            let unhypedIds = []
            let parentGamesToScan = {}
            for (let [key, game] of Object.entries(detailsMap)) {
            // for (let a = 0; a < detailsJson.length; a++) {
                // let game = detailsJson[a]
                if (!game.hypes) {
                    // if the game didn't have any hypes, assign zero and put it in the check list
                    game.hypes = 0
                    unhypedIds.push(key)
                }
                else if (game.hypes >= 5) {
                    // this game had any noteriety before release, so its ok to go in
                    if (game.hypes >= 10) {
                        // this game had more than usual, its automatically notable
                        game.notable = true
                    }
                }
                if (game.parent_game) {
                    parentGamesToScan[key] = game.parent_game
                }
            }
        }

        // let gameScoreMap = {}
        // for (item of popularityBall) {
        //     if (gameScoreMap[item.game_id] == undefined) {
        //         gameScoreMap[item.game_id] = 0
        //     }
        //     if (item.external_popularity_source.name == 'IGDB') {
        //         gameScoreMap[item.game_id] += 1
        //     } else {
        //         gameScoreMap[item.game_id] += 2
        //     }
        // }

        // return gameScoreMap

        // add popularity val to games without them
        for (chunk of chunkList(unhypedIds, 100)) {
            let popularityJson = await this.getGamePopularity(chunk)
            for (item of popularityJson) {
                if (detailsMap[item.game_id].hypes == undefined) {
                    detailsMap[item.game_id].hypes = 0
                }
                if (item.external_popularity_source.name == 'IGDB') {
                    detailsMap[item.game_id].hypes += 1
                } else {
                    detailsMap[item.game_id].hypes += 2
                }
            }
        }

        // remove parent games already in the database
        

        let parentGameList = Object.values(parentGamesToScan)
        
        let parentIdLists = []
        let dbParentIdList = []
        for (chunk of chunkList(parentGameList, 100)) {
            let shortIdsList = ''
            for (game in chunk) {
                shortIdsList += `id=${game.id}|`
                dbParentIdList.push(game.id)
            }
            shortIdsList = shortIdsList.slice(0, -1)  //remove trailing pipe
            parentIdLists.push(shortIdsList)
        }

        let dbParentCheck = await this.#gameIdsExist(Object.values(parentGameList))
        let parentsToAdd = dbParentCheck.filter((k,v) => v == false)

        let parentGamesToUpdate = {}
        for (parentIdList of parentIdLists) {
            let parentDetailsRes = await apicalypse({headers: this.authToken})
                .fields(detailsFields)
                .where(parentIdList)
                .sort('id','asc')
                .limit(500)
            await delay(1000)
            let parentDetailsJson = await parentDetailsRes.json()
            let parentDetailsMap = {}
            let listOfParentsInDatabase = await this.#gameIdsExist(dbParentIdList)
            for (let item of parentDetailsJson) {
                let alreadyInDatabase = listOfParentsInDatabase[item.id]
                // if (alreadyInDatabase) {
                //     parentGamesToUpdate[item.id] = 
                // } else {
                //     parentDetailsMap[item.id] = item
                // }
            }
            parentDetailsJson = []
        }

        let parentGamesToAdd = []
        for (let [subGameId, parentGameId] of Object.entries(parentGamesToScan)) {

        }

        // for each unhyped Id,
        // for (let [key, val] of Object.entries(unhypedMap)) {
        //     detailsMap[key].hypes += val
        // }

        //   is there a parent game? that means this game is a port or something
        //     that game might already be in the database, or hyped
        //     if it is,
        // for (let [key, val] of Object.entries(unhypedMap)) {
        //     detailsMap[key].hypes += val
        //     if (detailsMap[key].parent_game) {
        //         parentGamesToScan[key] = detailsMap[key].parent_game
        //     }
        // }

        // let detailsRes = await apicalypse({headers: this.authToken})
        //     .fields(detailsFields)
        //     .where(detailsIdList)
        //     .sort('id','asc')
        //     .limit(500)

        // igdbFields = igdbFields.replace('\n', '')
        // let igdbBody = 
        //     `${idList};
        //     sort id desc;
        //     limit 500;`
        // igdbBody = igdbBody.replace('\n', '')
        // let detailsRes = await fetch('https://api.igdb.com/v4/games/', {
        //     method: 'post',
        //     headers: this.authToken,
        //     body: igdbBody
        // })

        // return detailsJson
    }

    async callIGDBForDetails() {

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
        // let popularityMap = this.calculatePopularites(popJson)
        return popJson
    }

    calculatePopularites(popularityBall) {
        let gameScoreMap = {}
        for (item of popularityBall) {
            if (gameScoreMap[item.game_id] == undefined) {
                gameScoreMap[item.game_id] = 0
            }
            if (item.external_popularity_source.name == 'IGDB') {
                gameScoreMap[item.game_id] += 1
            } else {
                gameScoreMap[item.game_id] += 2
            }
        }

        return gameScoreMap
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
