import 'dotenv/config'
import pg from 'pg'
const Client = pg.Client

function sqlize(str) {
    return str.replaceAll("'", "''")
}

function unsqlize(str) {
    return str.replaceAll("''", "'")
}

export default class Database {
    constructor() {
        this.client = new Client({
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.APP_POSTGRES_HOST,
            port: process.env.APP_POSTGRES_PORT,
            database: process.env.POSTGRES_DB
        })
    }

    async #runCmd(cmd) {
        console.log(cmd)
        let res = await this.client.query(cmd)
        return res
    }

    async connect() {
        await this.client.connect()
        let res = await this.#runCmd('select now()')
        console.log(res.rows)
    }

    async disconnect() {
        await this.client.end()
        // let res = await client.query('select now()')
    }

    async queryAllTiles() {
        let cmd = 'select * from tiles'
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async queryAllEvents(active=true) {
        let cmd = `
            select *
            from events
            where active=${active}`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async queryTilesForCard(eventName, eventYear) {
        let cmd = `
            select *
            from tiles
            join events on events.id=tiles.event_id
            where events.name='${eventName}' and events.year=${eventYear}`
            // where event_id=${eventId}` // and isVerified=TRUE`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async queryTileClustersForCard(eventName, eventYear) {
        let cmd = `
            select * from tile_clusters
                join events on events.id=tile_clusters.event_id
            where events.name='${eventName}' and events.year=${eventYear}`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async getAllTilesById(idList) {
        let cmd = `
            select * from tiles_normalized
            where id in (${idList.toString()})`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async queryAllSubmitters() {
        let cmd = `
            select *
            from submitter`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async allTilesFromUser(email) {
        let cmd = `
            select *
            from tiles
                join submitter on submitter.id=tiles.submitter_id
            where submitter.email='${email}'`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async eventIdByName(name, year) {
        let cmd = `
            select id
            from events
            where name='${name}' and year=${year}`
        let res = await this.#runCmd(cmd)
        return res.rows[0].id
    }

    async addTile(reqBody, imageLocations) {
        let event_id = await this.eventIdByName(reqBody.eventName, reqBody.eventYear)
        let query = '' 
        query += 'insert into tiles (event_id, '
        if (reqBody.combo == 1) {
            query += 'title_1, description_1, img_loc_1) '
            query += `values (${event_id}, `
            query += `"${reqBody.title1}", "${reqBody.description1}", "${imageLocations[0]}")`
        } else if (reqBody.combo == 2) {
            query += "title_1, description_1, img_loc_1, "
            query += "title_2, description_2, img_loc_2) "
            query += `values (${event_id}, `
            query += `"${reqBody.title1}", "${reqBody.description1}", "${imageLocations[0]}", `
            query += `"${reqBody.title2}", "${reqBody.description2}", "${imageLocations[1]}")`
        } else if (reqBody.combo == 3) {
            query += "title_1, description_1, img_loc_1, "
            query += "title_2, description_2, img_loc_2, "
            query += "title_3, description_3, img_loc_3) "
            query += `values (${event_id}, `
            query += `"${reqBody.title1}", "${reqBody.description1}", "${imageLocations[0]}", `
            query += `"${reqBody.title2}", "${reqBody.description2}", "${imageLocations[1]}", `
            query += `"${reqBody.title3}", "${reqBody.description3}", "${imageLocations[2]}")`
        }

        let res = await this.#runCmd(cmd)
        console.log(res)
        return res
    }

    async addTileNormalized(reqBody, imageLocations) {
        let eventId = await this.eventIdByName(reqBody.eventName, reqBody.eventYear)
        let tileQueries = []
        tileQueries[0] = "insert into tiles_normalized (title, description, img_loc) "
        tileQueries[0] += `values ('${sqlize(reqBody.title1)}', '${sqlize(reqBody.description1)}', '${sqlize(imageLocations[0])}') `
        tileQueries[0] += "returning id"
        // console.log(tileQueries[0])
        if (reqBody.title2 != null) {
            tileQueries[1] = 'insert into tiles_normalized (title, description, img_loc) '
            tileQueries[1] += `values ('${sqlize(reqBody.title2)}', '${sqlize(reqBody.description2)}', '${sqlize(imageLocations[1])}') `
            tileQueries[1] += "returning id"
        }

        if (reqBody.title3 != null) {
            tileQueries[2] = 'insert into tiles_normalized (title, description, img_loc) '
            tileQueries[2] += `values ('${sqlize(reqBody.title3)}', '${sqlize(reqBody.description3)}', '${sqlize(imageLocations[2])}') `
            tileQueries[2] += "returning id"
        }

        let clusterIds = ""
        for (let tileQuery of tileQueries) {
            let tileRes = await this.#runCmd(tileQuery)
            // console.log(tileRes)
            // console.log(tileRes.rows)
            // console.log(tileRes.rows[0])
            // console.log(tileRes.rows[0].id)
            clusterIds += tileRes.rows[0].id + ","  // ??? or soemthing ???
        }

        clusterIds = clusterIds.substring(0, clusterIds.length - 1)
        let clusterQuery = `
            insert into tile_clusters (event_id, tile_ids)
            values (${eventId}, '${clusterIds}')`
        let clusterRes = await this.#runCmd(clusterQuery)
        return clusterRes
    }
}
