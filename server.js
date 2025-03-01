let fs = require('fs')
let express = require('express')
let https = require('https')
let http = require('http')
let app = express()

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html')
    res.status(200).sendFile('./index.html', {root: __dirname})
})

app.use(express.static('img'))
app.use(express.static('data'))
app.use(express.static('js'))

const [server, port] = (() => {
    let server, port
    try {
        let certLoc = fs.readFileSync('/etc/letsencrypt/live/tga.bingo/fullchain.pem')
        let keyLoc = fs.readFileSync('/etc/letsencrypt/live/tga.bingo/privkey.pem')
        server = https.createServer(options, app)
        port = 443
        return [server, port]
    } catch (err) {
        server = http.createServer(app)
        port = 3000
        return [server, port]
    }
})()

server.listen(port, (err) =>{
    if (!err) {
        console.log('its on at ' + port)
    }
})
