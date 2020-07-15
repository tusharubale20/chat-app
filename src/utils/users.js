const users = []

const addUser = ({id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user with same info
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })
    
    if(existingUser) {
        return {
            error: 'Username is in use. Try with different username'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index!=-1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id )
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room
    })
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
