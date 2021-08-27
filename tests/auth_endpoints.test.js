const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')

const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')
const Blog = require('../models/blog')

const initializing = async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    for (let user of helper.initialUsers) {
        let passwordHash = await bcrypt.hash(user.password,10)
        let users = new User({ username:user.username, passwordHash: passwordHash, name: user.name })
        await users.save()
    }

    let savedUser = (await User.findOne({ username:'root' }))
    let blogObject = new Blog(helper.initialBlogs[0])

    blogObject['user'] = savedUser._id
    await blogObject.save()

    savedUser.blogs = savedUser.blogs.concat(blogObject._id)
    await savedUser.save()

    savedUser = (await User.findOne({ username:'Blunem' }))
    blogObject = new Blog(helper.initialBlogs[1])

    blogObject['user'] = savedUser._id
    await blogObject.save()

    savedUser.blogs = savedUser.blogs.concat(blogObject._id)
    await savedUser.save()
}

const getToken = async(username) => {
    const newUser = helper.getInitUser(username)
    const response = await api
        .post('/api/auth/login')
        .send({ password: newUser.password, username: newUser.username })
        .expect(200)
        .expect('Content-Type', /application\/json/)
    return (response.body.token)
}

describe('when there are some users in db', () => {

    beforeEach(initializing)

    test('getting users from the system', async () => {
        const token = await getToken('root')
        await api
            .get('/api/users')
            .set({ Authorization: 'bearer '+ token })
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const users = await helper.usersInDb()
        const usernames = users.map(u => u.username)
        expect(usernames).toContain('root')
        expect(usernames).toContain('Blunem')
    })

    test('successfull Log-in with a valid User', async () => {
        const newUser =  helper.getInitUser('Blunem')
        await api
            .post('/api/auth/login')
            .send({ password: newUser.password, username: newUser.username })
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    describe('fails to log-in with a', () => {
        test('non valid User', async () => {
            const newUser =  helper.getInitUser('Blunem')
            await api
                .post('/api/auth/login')
                .send({ password: newUser.password, username: 'Perro' })
                .expect(401)
                .expect('Content-Type', /application\/json/)
        })
        test('non valid password', async () => {
            const newUser = helper.getInitUser('Blunem')
            await api
                .post('/api/auth/login')
                .send({ password:'casageo', username: newUser.username })
                .expect(401)
                .expect('Content-Type', /application\/json/)
        })
        test('missing username', async () => {
            const newUser = helper.getInitUser('Blunem')
            await api
                .post('/api/auth/login')
                .send({ password: newUser.password })
                .expect(400)
                .expect('Content-Type', /application\/json/)
        })
        test('missing password', async () => {
            const newUser = helper.getInitUser('Blunem')
            await api
                .post('/api/auth/login')
                .send({ username: newUser.username })
                .expect(400)
                .expect('Content-Type', /application\/json/)
        })
    })

    describe('creating blogs with a logged user', () => {
        test('successfully create a blog entry', async () => {
            const token = await getToken('Blunem')
            const blog = {
                'title': 'It worked!!!!',
                'author': 'Guadalupe V.',
                'url' : 'http://www.ghsystems.com',
            }

            await api
                .post('/api/blogs')
                .send(blog)
                .set({ Authorization: 'bearer '+ token })
                .expect(201)
        })

        test('fail to create a blog entry without login', async () => {
            const blog = {
                'title': 'It worked!!!!',
                'author': 'Guadalupe V.',
                'url' : 'http://www.ghsystems.com',
            }

            await api
                .post('/api/blogs')
                .send(blog)
                .expect(401)
        })

    })

    describe('Deleting blogs', () => {
        test('users can delete their own blogs ', async () => {
            const token = await getToken('Blunem')
            const user = await helper.getUserFromDb('Blunem')
            const blogToDelete = await helper.getBlogInDbById(user.blogs[0].id)

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({ Authorization: 'bearer '+ token })
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
        })

        test('users cannot delete other users blogs ', async () => {
            const token = await getToken('root')
            const user = await helper.getUserFromDb('Blunem')
            const blogToDelete = await helper.getBlogInDbById(user.blogs[0].id)

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({ Authorization: 'bearer '+ token })
                .expect(401)
        })

        test('cannot delete blogs without authentication', async () => {
            const user = await helper.getUserFromDb('Blunem')
            const blogToDelete = await helper.getBlogInDbById(user.blogs[0].id)

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(401)
        })

        test('fails with statuscode 400 if id is not valid', async () => {
            const token = await getToken('Blunem')

            const testId = 'someInvalidId'
            await api
                .delete(`/api/blogs/${testId}`)
                .set({ Authorization: 'bearer '+ token })
                .expect(400)
        })

        test('fails with statuscode 404 if id is missing', async () => {
            const token = await getToken('Blunem')

            const testId = ''
            await api
                .delete(`/api/blogs/${testId}`)
                .set({ Authorization: 'bearer '+ token })
                .expect(404)
        })

        test('users can delete their own blogs ', async () => {
            const token = await getToken('Blunem')
            const user = await helper.getUserFromDb('Blunem')
            const blogToDelete = await helper.getBlogInDbById(user.blogs[0].id)

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({ Authorization: 'bearer '+ token })
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({ Authorization: 'bearer '+ token })
                .expect(404)
        })

    })

    describe('Voting Blogs', () => {
        test('a specific blog can be updated', async () => {
            const token = await getToken('Blunem')
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = { ...blogsAtStart[0],likes:101 }

            await api
                .put(`/api/blogs/vote/${blogToUpdate.id}`)
                .send(blogToUpdate)
                .set({ Authorization: 'bearer '+ token })
                .expect(200)

            const blogsUpdated = await helper.blogsInDb()
            expect(blogsUpdated[0].likes).toBe(blogToUpdate.likes)
        })

        test('fails with statuscode 400 if id is not valid',async() => {
            const token = await getToken('Blunem')
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = { ...blogsAtStart[0],likes:101 }

            const testId = 'someInvalidId'
            await api
                .put(`/api/blogs/vote/${testId}`)
                .send(blogToUpdate)
                .set({ Authorization: 'bearer '+ token })
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd[0].likes).toBe(blogsAtStart[0].likes)
        })

        test('Fails when atempting vote a deleted blog', async () => {
            const token = await getToken('Blunem')

            const user = await helper.getUserFromDb('Blunem')
            const blogToDelete = await helper.getBlogInDbById(user.blogs[0].id)

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({ Authorization: 'bearer '+ token })
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

            const blogToUpdate = { ...blogToDelete,likes:101 }

            await api
                .put(`/api/blogs/vote/${blogToUpdate.id}`)
                .send(blogToUpdate)
                .set({ Authorization: 'bearer '+ token })
                .expect(404)
        })
    })


})

afterAll(() => {
    mongoose.connection.close()
})