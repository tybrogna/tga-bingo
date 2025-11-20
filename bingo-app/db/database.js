import 'dotenv/config'
import pg from 'pg'
const Client = pg.Client

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

    async connect() {
        await this.client.connect()
        let res = await this.client.query('select now()')
        console.log(res.rows)
    }

    async disconnect() {
        await this.client.end()
        // let res = await client.query('select now()')
    }

    // async qaAdd(title) {
    //     await this.client.query(
    //         'insert into tiles(title) values ($1)',
    //         [title]
    //     )
    // }

    async queryAllTiles() {
        let cmd = 'select * from tiles'
        let res = await this.client.query(cmd)
        return res.rows
    }

    async queryAllEvents(active=true) {
        let cmd = `
            select *
            from events
            where active=${active}`
        let res = await this.client.query(cmd)
        return res.rows
    }

    async queryTilesForCard(eventId) {
        let cmd = `
            select *
            from tiles
            where event_id=${eventId}` // and isVerified=TRUE`
        console.log(cmd)
        let res = await this.client.query(cmd)
        return res.rows
    }

    async queryAllSubmitters() {
        let cmd = `
            select *
            from submitter`
        let res = await this.client.query(cmd)
        return res.rows
    }

    async allTilesFromUser(email) {
        let cmd = `
            select *
            from tiles
                join submitter on submitter.id=tiles.submitter_id
            where submitter.email='${email}'`
        let res = await this.client.query(cmd)
        return res.rows
    }

    async eventIdByName(name, year) {
        let cmd = `
            select id
            from events
            where name='${name}' and year=${year}`
        console.log(cmd)
        let res = await this.client.query(cmd)
        return res.rows[0].id
    }

    async addTile(reqBody, imageLocations) {
        let event_id = await this.eventIdByName(reqBody.eventName, reqBody.eventYear)
        let query = '' 
        query += 'insert into tiles (event_id, '
        if (reqBody.combo == 1) {
            query += 'title_1, description_1, img_loc_1) '
            query += `values (${event_id}, `
            query += `'${reqBody.title1}', '${reqBody.description1}', '${imageLocations[0]}')`
        } else if (reqBody.combo == 2) {
            query += 'title_1, description_1, img_loc_1, '
            query += 'title_2, description_2, img_loc_2) '
            query += `values (${event_id}, `
            query += `'${reqBody.title1}', '${reqBody.description1}', '${imageLocations[0]}', `
            query += `'${reqBody.title2}', '${reqBody.description2}', '${imageLocations[1]}')`
        } else if (reqBody.combo == 3) {
            query += 'title_1, description_1, img_loc_1, '
            query += 'title_2, description_2, img_loc_2, '
            query += 'title_3, description_3, img_loc_3) '
            query += `values (${event_id}, `
            query += `'${reqBody.title1}', '${reqBody.description1}', '${imageLocations[0]}', `
            query += `'${reqBody.title2}', '${reqBody.description2}', '${imageLocations[1]}', `
            query += `'${reqBody.title3}', '${reqBody.description3}', '${imageLocations[2]}')`
        }

        console.log(query)

        // let res = await this.client.query(query)
        // return res
    }
}