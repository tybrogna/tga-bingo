import 'dotenv/config'
import pg from 'pg'
import apicalypse from 'apicalypse'
import { utcOneWeek, utcNow } from './functionhider.js'

const Client = pg.Client

//i issued a new client secret cuz im braindead and uploaded the old one
const clientId = process.env.IGDB_CLIENT
const clientSecret = process.env.IGDB_SECRET
const igdbUrl = 'https://api.igdb.com/v4/'


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

class IGDBJob {
    db
    authToken
    gamesQueried = 0
    gamesUpdated = 0
    constructor() {
        this.db = new Client({
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.APP_POSTGRES_HOST,
            port: process.env.POSTGRES_IMAGE_PORT,
            database: "bingo-db"
        })
    }

    async connect() {
        await this.db.connect()
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
        let res = await this.client.query(cmd)
        return res
    }

    async getAuthToken() {
        let tokenCmd = `select * from igdb_api_keys`
        let tokenRes = await this.#runCmd(tokenCmd)
        let now = utc()
        if (tokenRes.rows.length == 0) {
            console.log('no token in db, adding one')
            let bearerInfo = await this.fetchBearer()
            let storeTokenCmd = `insert into igdb_api_keys
                (token, expires_at) values
                ('${bearerInfo.access_token}', ${bearerInfo.expiryTime})`
            await this.#runCmd(storeTokenCmd)
            tokenRes = await this.#runCmd(tokenCmd)
        }

        let token = tokenRes.rows[0]
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
        let timeEnd = utcNow()
        let timeStart = timeEnd - utcOneWeek
        let offset = 0
        let fullGameList = []
        while (offset != 0 && offset % 500 == 0) {
            let gamesRes = await apicalypse({headers: this.authToken})
                .fields('id, game, date')
                .where(`date > ${timeStart}`)
                .where(`date < ${timeEnd}`)
                .where('release_region = 8')
                .sort('id', 'desc')
                .offset(offset)
                .limit(500)
                .request(igdbUrl + 'release_dates')
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
        let detailsIdList = ''
        for (game of gameList) {
            detailsIdList += 'id=' + game.id + '|'
        }
        detailsIdList = detailsIdList.slice(0, -1)
        let detailsFields = ''
        detailsFields += 'id,'
        detailsFields += 'name,'
        detailsFields += 'cover,'
        detailsFields += 'platforms.name,'
        detailsFields += 'first_release_date,'
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

        let detailsRes = await apicalypse({headers: this.authToken})
            .fields(detailsFields)
            .where(detailsIdList)
            .sort('id','asc')
            .limit(500)

        // let igdbFields = 
        //     `fields
        //         id,
        //         name,
        //         cover,
        //         platforms.name,
        //         first_release_date,
        //         game_type,
        //         game_status,
        //         keywords,
        //         parent_game,
        //         involved_companies.company.name,
        //         involved_companies.developer,
        //         involved_companies.supporting,
        //         involved_companies.porting,
        //         involved_companies.publisher`
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

        let detailsJson = await detailsRes.json()
        let okGameTypes = [0,2,4,7,8,9,11]
        let okGameStatus = [undefined, 0, 4]
        // 0 main_game, 2 expansion, 4 standalone_expansion, 7 season, 8 remake, 9 remaster, 11 port
        detailsJson = detailsJson
            .filter(g => okGameTypes.includes(g.game_type))
            .filter(g => okGameStatus.includes(g.game_status))
        let rollingIds = []
        for (let a = 0; a < detailsJson.length; a++) {
            let game = detailsJson[a]
            if (game.hypes >= 10) { continue } // this game is both ok to go in and notable
            rollingIds.push(game.id)
            if (rollingIds.length >= 50) {
                let popIdList = ''
                for (id of rollingIds) {
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
                let popJson = await popRes.json()
                // continue here
            }
        }
        return detailsJson
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
