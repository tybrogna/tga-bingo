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
    }

    async disconnect() {
        await this.client.end()
        // let res = await client.query('select now()')
    }

    async qaAdd(title) {
        await this.client.query(
            'insert into tiles(title) values ($1)',
            [title]
        )
    }

    async queryAllTiles() {
        let res = await this.client.query(
            'select * from tiles'
        )
        return res.rows
    }

    async queryAllSubmitters() {
        let res = await this.client.query(
            'select * from submitter'
        )
        return res.rows
    }


    async allTilesFromUser(email) {
        let res = await this.client.query(
            `select * from tiles
            join submitter on submitter.id=tiles.submitter_id
            where submitter.email='${email}'`
        )
        return res.rows

    }
}