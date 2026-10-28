import 'dotenv/config'
import pg from 'pg'
import { sqlize, unsqlize, range } from './functionhider.js'
const Client = pg.Client

// function sqlize(str) {
//     return str.replaceAll("'", "''")
// }

// function unsqlize(str) {
//     return str.replaceAll("''", "'")
// }

export default class Database {
    constructor() {
        console.log(process.env.POSTGRES_USER, process.env.POSTGRES_HOST, process.env.POSTGRES_PORT)
        this.client = new Client({
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: 'tga-database',
            port: process.env.POSTGRES_PORT,
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

    async getTables() {
        let cmd = `SELECT tablename FROM pg_catalog.pg_tables where schemaname='public';`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async getRows(table, offset = 0) {
        let cmd = `SELECT * FROM ${table} LIMIT 100 OFFSET ${offset};`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async createUser(email, username, passwordHash) {
        let cmd = `
            insert into users (email, username, password_hash)
            values ('${email}', '${username}', '${passwordHash}')`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async retrieveUser(email="", username="") {
        let cmd
        if (email != "") {
            cmd = `select * from users where email='${email}'`
        } else if (username != "") {
            cmd = `select * from users where username='${username}'`
        }
        let res = await this.#runCmd(cmd)
        return res.rows[0]
    }

    async queryAllTiles() {
        let cmd = 'select * from tiles'
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async activeEvent() {
        let cmd = `
            select *
            from events
            where active=true;`
        let res = await this.#runCmd(cmd)
        return res.rows[0]
    }

    async queryEvents(title, year) {
        let cmd = `
            select *
            from events
            where name='${title.toLowerCase()}' and year=${year};`
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

    async getGames(term, thisYearOnly=false, notableOnly=false, vrOnly=false, remasterOnly=false, mobileOnly=false) {
        let cmd = 'select id,name,igdb_cover_id from games '
        let adds = []
        if (term != undefined) {
            term = term.replaceAll('\'', '')
            term = term.replaceAll(' ', '%')
            adds.push(` name ilike '%${term}%'`)
        }
        // if (thisYearOnly) {
        //     adds.push(``)
        // }

        if (adds.length > 0) {
            cmd = cmd.concat(' where')
            adds.forEach(a => {
                cmd = cmd.concat(a)
            })
        }
        cmd = cmd.concat(` limit 100;`)
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async getGamesByIds(strList) {
        let cmd = ''
        if (strList == undefined) {
            cmd = `select id,name,igdb_cover_id from games limit 100;`
        } else {
            cmd = `select id,name,igdb_cover_id from games where id in (${strList});`
        }
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    async getNomineeCategories(e_id) {
        if (e_id == undefined) {
            e_id = 1
        }
        let cmd = `select id,name,locked from nominee_categories where event_id=${e_id};`
        let res = await this.#runCmd(cmd)
        return res.rows
    }

    /**
     * this works because the statement is an upsert (insert or update), fixed to a
     * unique index marked by the combination of user_id and category_id.
     * databases are pretty cool once you start trying to make them do weird stuff
     */
    async saveUserNominations(saveObj) {
        console.log(saveObj.userId)
        if (saveObj.userId == undefined) {
            return
        }
        let cmd = `insert into user_nominations (user_id, category_id, game_ids) values `
        saveObj.selections.forEach(sel => {
            cmd = cmd.concat(`(${saveObj.userId}, ${sel.id}, array[${sel.games.toString()}]::integer[]),`)
        })
        cmd = cmd.slice(0, -1)
        cmd = cmd.concat(` on conflict (user_id, category_id) `)
        cmd = cmd.concat(`do update set game_ids = EXCLUDED.game_ids;`)
        // console.log(cmd)
        this.#runCmd(cmd)
    }

    // i hate this i know theres a one-liner way to do it in sql but im not smart enough to do it
    async getUserNominations(userId, eventId) {
        let cmd
        if (eventId == undefined) {
            cmd = `select `
            cmd = cmd.concat(`nominee_categories.id,nominee_categories.name,nominee_categories.locked from nominee_categories join `)
            cmd = cmd.concat(`events on nominee_categories.event_id=events.id where events.active=true order by id;`)
        } else {
            cmd = `select id,name,locked from nominee_categories where event_id=${eventId} order by id;`
        }
        let rows = (await this.#runCmd(cmd)).rows
        cmd = `select category_id, game_ids from user_nominations where category_id in (${rows.map(r => r.id).toString()}) and user_id=${userId} order by category_id;`
        let noms = (await this.#runCmd(cmd)).rows
        if (noms.length == 0) {
            rows.forEach(r => r.game_ids = [])
        } else if (noms.length == rows.length) {
            range(rows.length).forEach(idx => {
                rows[idx].game_ids = noms[idx].game_ids
            })
        } else {
            console.log('the stupid thing with mismatched category and user nominations has happened')
        }
        // console.log(rows)
        return rows

        // cmd = `user_nominations.category_id, nominee_categories.name, user_nominations.game_ids from nominee_categories `
        // cmd = cmd.concat(`inner join user_nominations on nominee_categories.id=user_nominations.category_id `)
        // cmd = cmd.concat(`where nominee_categories.event_id=${eventId} and `)
        // cmd = cmd.concat(`user_nominations.user_id=${userId};`)
        // let rows = await this.#runCmd(cmd)
        // return rows
    }
}
