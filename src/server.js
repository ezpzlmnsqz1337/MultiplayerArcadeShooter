const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(server)
const port = 3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/index.html'))
})

app.use(express.static("./dist"))

server.listen(port, () => console.log(`Example app listening on port ${port}!`))


// game related shit
const players = {}
const bullets = {}

// event handlers
function playerConnected(socket) {
    console.log('player connected')
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    }
    // send the players object to the new player
    socket.emit('currentPlayers', players)
    // update all other players of the new player
    socket.broadcast.emit('player:connected', players[socket.id])
}

function playerDisconnected(socket) {
    console.log('Player disconnected', socket.id)
    // remove this player from our players object
    delete players[socket.id]
    // emit a message to all players to remove this player
    io.emit('player:disconnected', socket.id)
}

// events
io.on('connection', function (socket) {
    playerConnected(socket)

    socket.on('player:movement', function (movementData) {
        players[socket.id].x = movementData.x
        players[socket.id].y = movementData.y
        players[socket.id].animation = movementData.animation
        // emit a message to all players about the player that moved
        socket.broadcast.emit('player:moved', players[socket.id])
    })

    socket.on('bullet:created', function (bullet) {
        bullets[bullet.bulletId] = {
            x: bullet.x,
            y: bullet.y
        }
        // emit a message to all players about the bullet that moved
        socket.broadcast.emit('currentBullets', bullets)
    })

    socket.on('bullet:movement', function (movementData) {
        console.log('B id: ', movementData.bulletId)
        console.log('Bullets: ', bullets)
        console.log('Movement data: ', movementData)
        bullets[movementData.bulletId].x = movementData.x
        bullets[movementData.bulletId].y = movementData.y
        // emit a message to all players about the bullet that moved
        socket.broadcast.emit('bullet:moved', bullets[movementData.bulletId])
    })

    socket.on('disconnect', function () {
        playerDisconnected(socket)
    })
})

