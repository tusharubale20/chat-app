const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT | 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// on connect event
io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        //emits event to that particular connection
        socket.emit('message', generateMessage('Chatbot','Welcome!!!'))

        //emits event to all connections in room except the current one
        socket.broadcast.to(user.room).emit('message', generateMessage('Chatbot',`${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('messageSent', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed.')
        }

        const user = getUser(socket.id)

        //emits event to all connections
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()


    })

    socket.on('sendLocation', (coordinates, callback) => {
        const user = getUser(socket.id)

        const url = `https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url))
        callback()
    })

    //on disconnect event
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Chatbot',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})