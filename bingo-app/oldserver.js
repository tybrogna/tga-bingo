let fs = require('fs')
let express = require('express')
let https = require('https')
let http = require('http')
let app = express()

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html')
    res.status(200).sendFile('./index.html', {root: __dirname})
})

app.get('/testimg', (req, res) => {
    res.status(200).sendFile('./img/bingo-24/2k4.jpg', {root: __dirname})
})

app.use(express.static('img'))
app.use(express.static('data'))
app.use(express.static('js'))

const [server, port] = (() => {
    let server, port
    try {
        let keyFile = fs.readFileSync('/etc/letsencrypt/live/tga.bingo/privkey.pem')
        let certFile = fs.readFileSync('/etc/letsencrypt/live/tga.bingo/cert.pem')
        let chainFile = fs.readFileSync('/etc/letsencrypt/live/tga.bingo/fullchain.pem')
        let options = {
            key: keyFile,
            cert: certFile,
            ca: chainFile
        }
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
