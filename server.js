let express = require('express')
let app = express()

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html')
    res.status(200).sendFile('./index.html', {root: __dirname})
})

app.use(express.static('img'))
app.use(express.static('data'))
app.use(express.static('js'))

app.listen(3000, (err) => {
    if (!err) {
        console.log('Server On')
    } else {
        console.log(err)
    }
})