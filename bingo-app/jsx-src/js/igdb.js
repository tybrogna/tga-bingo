import 'dotenv/config'
import pg from 'pg'
const Client = pg.Client

const clientId = '27tqafcwp7di0gz90bs0mv91yq7q8c'
const clientSecret = 'xbrbzrc0m8687aha647j2krvzd41nr'
const fourWeeks = 4 * 7 * 24 * 60 * 60 // in seconds
const utc = () => { return Math.floor(new Date().getTime() / 1000) }


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
    db;
    gamesQueried = 0;
    gamesUpdated = 0;
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
    }

    async disconnect() {
        await this.client.end()
        console.log('IGDB Job Ended')
        console.log()
        // let res = await client.query('select now()')
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
            let bearerInfo = await this.fetchBearer()
            let storeTokenCmd = `insert into igdb_api_keys
                (token, expires_at) values
                ('${bearerInfo.access_token}', ${bearerInfo.expiryTime})`
            await this.#runCmd(storeTokenCmd)
            tokenRes = await this.#runCmd(tokenCmd)
        }

        let token = tokenRes.rows[0]
        if (token.expires_at + fourWeeks > now) {
            //four weeks from now is less than now, token is valid
            return {
                accept: 'application/json',
                'client-id': clientId,
                'authorization': 'Bearer ' + token.token,
            }
        } else {
            let bearerJson = await this.fetchBearer(now)
            let updateTokenCmd = `update igdb_api_keys set
                token='${bearerJson.access_token}', expires_at=${bearerJson.expiryTime}
                where id=${token.id}`
            await this.#runCmd(updateTokenCmd)
            return {
                accept: 'application/json',
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

    async getGames(timeStart, timeEnd) {

    }
}
