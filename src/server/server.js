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
        x: 90,
        y: 80,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    }
    // send the players object to the new player
    socket.emit(EventType.CURRENT_PLAYERS, players)
    socket.emit(EventType.CURRENT_BULLETS, bullets)
    // update all other players of the new player
    socket.broadcast.emit(EventType.PLAYER_CONNECTED, players[socket.id])
}

function playerDisconnected(socket) {
    console.log('Player disconnected', socket.id)
    // remove this player from our players object
    delete players[socket.id]
    // emit a message to all players to remove this player
    io.emit(EventType.PLAYER_DISCONNECTED, socket.id)
}

// events
const EventType = Object.freeze({
    PLAYER_SHOOT: 'player:shoot',
    CURRENT_PLAYERS: 'currentPlayers',
    PLAYER_CONNECTED: 'player:connected',
    PLAYER_DISCONNECTED: 'player:disconnected',
    PLAYER_MOVED: 'player:moved',
    PLAYER_MOVEMENT: 'player:movement',
    CURRENT_BULLETS: 'currentBullets',
    BULLET_CREATED: 'bullet:created',
    BULLET_REMOVE: 'bullet:remove'
})

io.on('connection', socket => {
    playerConnected(socket)

    socket.on(EventType.PLAYER_MOVEMENT, movementData => {
        players[socket.id].x = movementData.x
        players[socket.id].y = movementData.y
        players[socket.id].animation = movementData.animation
        // emit a message to all players about the player that moved
        socket.broadcast.emit(EventType.PLAYER_MOVED, players[socket.id])
    })

    socket.on(EventType.BULLET_CREATED, bullet => {
        console.log('Create bullet: ', bullet)
        bullets[bullet.id] = bullet
        // emit a message to all players about the bullet that moved
        socket.broadcast.emit(EventType.CURRENT_BULLETS, bullets)
    })

    socket.on(EventType.BULLET_REMOVE, bullet => {
        console.log('Remove bullet: ', bullet)
        delete bullets[bullet.id]
        // emit a message to all players about the bullet that moved
        // socket.broadcast.emit(EventType.CURRENT_BULLETS, bullets)
    })

    socket.on('bullet:movement', movementData => {        
        // console.log('Bullets: ', Object.keys(bullets).length)
        console.log('Bullets: ', Object.keys(bullets))
        bullets[movementData.id].x = movementData.x
        bullets[movementData.id].y = movementData.y
        // emit a message to all players about the bullet that moved
        socket.broadcast.emit('bullet:moved', bullets[movementData.id])
    })

    socket.on('disconnect', () => {
        playerDisconnected(socket)
    })
})

