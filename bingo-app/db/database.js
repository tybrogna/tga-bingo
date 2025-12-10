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
            port: process.env.POSTGRES_IMAGE_PORT,
            database: "bingo-db"
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
            where events.name='${eventName}' and events.year=${eventYear}
            and tiles.isFree=false`
            // where event_id=${eventId}` // and isVerified=TRUE`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async queryTileClustersForCard(eventName, eventYear, free=false) {
        let cmd = `
            select * from tile_clusters
                join events on events.id=tile_clusters.event_id
            where events.name='${eventName}' and events.year=${eventYear}
            order by is_free desc`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async getAllTilesById(idList) {
        let cmd = `
            select * from tiles
            where id in (${idList.toString()})
            order by array_position(array[${idList.toString()}], id)`
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
        let eventId = await this.eventIdByName(reqBody.eventName, reqBody.eventYear)
        let tileQueries = []
        tileQueries[0] = "insert into tiles (title, description, img_loc) "
        tileQueries[0] += `values ('${sqlize(reqBody.title1)}', '${sqlize(reqBody.description1)}', '${sqlize(imageLocations[0])}') `
        tileQueries[0] += "returning id"
        // console.log(tileQueries[0])
        if (reqBody.title2 != null) {
            tileQueries[1] = 'insert into tiles (title, description, img_loc) '
            tileQueries[1] += `values ('${sqlize(reqBody.title2)}', '${sqlize(reqBody.description2)}', '${sqlize(imageLocations[1])}') `
            tileQueries[1] += "returning id"
        }

        if (reqBody.title3 != null) {
            tileQueries[2] = 'insert into tiles (title, description, img_loc) '
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
            insert into tile_clusters (event_id, tile_ids, is_free)
            values (${eventId}, '${clusterIds}', FALSE)`
        let clusterRes = await this.#runCmd(clusterQuery)
        return clusterRes
    }

    async addOrUpdateFreeTile(reqBody, imageLocations) {
        let eventId = await this.eventIdByName(reqBody.eventName, reqBody.eventYear)
        let cmd = 'insert into tiles (title, description, img_loc '
        cmd += `values ('${squlize(reqBody.title1)}', '${sqlize(reqBody.description1)}', '${squlize(imageLocations[0])})`
        cmd += 'returing id'
        let tileRes = await this.#runCmd(cmd)
        clusterId = tileRes.rows[0].id

        let freeTile = await this.#runCmd(`select * from tile_clusters where event_id=${eventId} and are_free=TRUE`)
        if (freeTile.rows.length == 0) {
            cmd = 'insert into tile_clusters (event_id, tile_ids, is_free)'
            cmd += `values (${eventId}, '${clusterId}', TRUE)`
            let clusterRes = await this.#runCmd(cmd)
            return clusterRes
        } else {
            let idsUpdate = freeTile.rows[0].tile_ids + ',' + clusterId
            cmd = `update tile_clusters set tile_ids=${idsUpdate} where id=${freeTile.rows[0].id}`
        }
    }
}
