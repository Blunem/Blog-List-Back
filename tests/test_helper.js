const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        'comments': [],
        'title' : 'IoT',
        'author' : 'Gudadalupe V.',
        'url': 'https://www.applesfera.com',
        'likes': 13
    },
    {
        'comments': [],
        'title' : 'Machine Learning',
        'author' : 'Omar L.',
        'url': 'https://www.xataka.com',
        'likes': 11
    }
]
const initialUsers = [
    {
        username: 'root',
        name: 'Guadalupe V.',
        password: '$Charay2021'
    },
    {
        username: 'Blunem',
        name: 'Omar V.',
        password: '$Fullstack2021'
    }
]
const nonExistingId = async () => {
    const blog = new Blog({
        'title' : 'willremovethissoon',
        'author' : 'w.r.t',
        'url': 'https://www.willremovethissoon',
        'likes': 0
    })
    await blog.save()
    await blog.remove()
    return blog._id.toString()
}

const blogsInDb = async () => {
    const blog = await Blog.find({})
    return blog.map(blog => blog.toJSON())
}

const getBlogInDbById = async (id) => {
    const blog = await Blog.find({})
    return blog.map(blog => blog.toJSON()).find(b => b.id === id)
}
const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

const getInitUser = (username) => {
    return initialUsers.find(u => u.username===username)
}

const getUserFromDb = async (username) => {
    const users = await User.find({}).populate('blogs', { id:1 })
    return users.find(u => u.username===username).toJSON()
}

module.exports = {

    initialBlogs,
    getUserFromDb,
    getInitUser,
    getBlogInDbById,
    blogsInDb,
    nonExistingId,
    usersInDb,
    initialUsers
}