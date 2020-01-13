import SceneBuilder from '../builders/SceneBuilder'
import FpsText from '../objects/fpsText'

import io from 'socket.io-client'

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
    this.fpsText = null
    this.sceneBuilder = SceneBuilder.getInstance()
    this.cursors = null
    this.socket = null        
    this.stars = null
    this.bombs = null
    this.spacebar = null
    this.score = 0
    this.gameOver = false
    this.scoreText = null
  }

  bindEvents(scene) {
    this.socket = io('http://malina:3000')
    this.socket.on('connect', () => console.log('connect'))
    this.socket.on('disconnect', () => console.log('disconnect'))

    this.socket.on('currentPlayers', players => {
        console.log('Current players: ', players)
        Object.keys(players).forEach(id => {
            if (players[id].playerId === this.socket.id) {
                this.sceneBuilder.addPlayer(scene, players[id])
            } else {
                this.sceneBuilder.addOtherPlayers(scene, players[id])
            }
        })
    })

    this.socket.on('player:connected', playerInfo => {
        console.log('Player connected: ', playerInfo)
        this.sceneBuilder.addOtherPlayers(scene, playerInfo)
    })

    this.socket.on('player:disconnected', playerId => {
        console.log('Player disconnected: ', playerId)
        this.sceneBuilder.getOtherPlayers().getChildren().forEach(x => {
            if (playerId === x.playerId) {
                x.destroy()
            }
        })
    })

    this.socket.on('player:moved', playerInfo => {
        this.sceneBuilder.getOtherPlayers().getChildren().forEach(x => {
            if (playerInfo.playerId === x.playerId) {
                x.setPosition(playerInfo.x, playerInfo.y)
                const loop = ['left', 'right'].includes(playerInfo.animation) ? true : false
                x.anims.play(playerInfo.animation, loop)
            }
        })
    })

    this.socket.on('currentBullets', bullets => {
        Object.keys(bullets).forEach(bullet => {
            // this.sceneBuilder.addBullet(scene, bullet.x, bullet.y, { bulletId: bullet.bulletId })
        })
    })
  }

  create() {
    this.bindEvents(this)

    this.fpsText = new FpsText(this)
    //  A simple background for our game
    this.add.image(400, 300, 'sky')

    //  The platforms group contains the ground and the 2 ledges we can jump on

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    console.log('Create')
    this.sceneBuilder.addPlatform(this, 400, 568, { name: 'platform', scale: 2 })

    //  Now let's create some ledges
    this.sceneBuilder.addPlatform(this, 600, 400, { name: 'platform' })
    this.sceneBuilder.addPlatform(this, 50, 250, { name: 'platform' })
    this.sceneBuilder.addPlatform(this, 750, 220, { name: 'platform' })

    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys()//  Input Events
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    //  The score
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })

    // display the Phaser.VERSION
    this.add
      .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
        color: '#000000',
        fontSize: 24
      })
      .setOrigin(1, 0)
  }

  update() {
    this.fpsText.update()

    if (!this.sceneBuilder || !this.sceneBuilder.getPlayer() || this.gameOver) return
    const player = this.sceneBuilder.getPlayer()
    const bullets = this.sceneBuilder.getBullets()

    if (this.cursors.left.isDown) {
        player.setVelocityX(-160)

        player.anims.play('left', true)
    } else if (this.cursors.right.isDown) {
        player.setVelocityX(160)

        player.anims.play('right', true)
    } else {
        player.setVelocityX(0)

        player.anims.play('turn')
    }

    if (this.cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330)
    }

    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        const y = player.body.top + player.height / 2
        console.log(player.body)
        const bullet = this.sceneBuilder.addBullet(this, player.x, y, { bulletType: 'player', direction: player.anims.currentAnim.key })
        this.socket.emit('bullet:created', { x: bullet.x, y: bullet.y, bulletId: bullet.bulletId })
    }

    // emit player movement
    const x = player.x
    const y = player.y
    const animation = player.anims.currentAnim.key

    if (player.oldPosition) {
        const positionChanged = x !== player.oldPosition.x
            || y !== player.oldPosition.y
            || animation !== player.oldPosition.animation
        if (positionChanged) {
            this.socket.emit('player:movement', { x, y, animation })
        }
    }
    
    // save old position data
    player.oldPosition = { x, y, animation }

    // emit bullet movement
    if (!bullets) return

    bullets.getChildren().forEach(b => {
        const x = b.x
        const y = b.y
        const bulletId = b.bulletId

        if (b.oldPosition) {
            const positionChanged = x !== b.oldPosition.x
                || y !== b.oldPosition.y
            if (positionChanged) {
                this.socket.emit('bullet:movement', { x, y, bulletId })
            }
        }
        
        // save old position data
        b.oldPosition = { x, y }
    })
  }
}
