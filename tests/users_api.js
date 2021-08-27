const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')


const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')
const Blog = require('../models/blog')


describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})

        const passwordHash = await bcrypt.hash('$Charay2021', 10)
        const user = new User({ username: 'root', passwordHash, name: 'Omar Valenzuela' })

        await user.save()

        const savedUser = (await User.findOne({ username:'root' })).toJSON()

        for (let blog of helper.initialBlogs) {
            let blogObject = new Blog(blog)
            blogObject['user'] = savedUser.id
            await blogObject.save()
        }
    })

    test('creation succeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Blunem',
            name : 'Omar Valenzuela',
            password: '@Fullstack20'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)

    })
    test('creation fails if a username is repeated, and responds with error 400', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Blunem',
            name : 'Omar Valenzuela',
            password: '@Fullstack20'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        let usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    })
    describe('fails to create a new user and responds with status code 400 bad request ', () => {
        test('when [username] value is missing', async() => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                name : 'Omar Valenzuela',
                password: '@Fullstack20'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)


        })

        test('when [name] value is missing', async() => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'Blunem',
                password: '@Fullstack20'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)


        })

        test('when [password] value is missing', async() => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'Blunem',
                name : 'Omar Valenzuela'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)


        })

        test('when [username] value is not valid', async() => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'Blu',
                password: '@Facasdas2020',
                name : 'Omar Valenzuela'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })

        test('when [password] value is not valid', async() => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'Blunem',
                password: 'facasdas',
                name : 'Omar Valenzuela'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })

    })




    // test('blog creation succeds with a user logged in', async () => {
    //     const userObject = {
    //         username: 'Blunem',
    //         name : 'Omar Valenzuela',
    //         password: '@Fullstack20'
    //     }

    //     const newUser = new User(userObject)

    //     await newUser.save()

    // })

    // test('blog creation succeds with a user logged-in ', async () => {
    //     const usersAtStart = await helper.usersInDb()
    //     const blogsAtStart = await helper.blogsInDb()

    //     const testUserId = usersAtStart[0].id

    //     const blog = new Blog({
    //         'title' : 'Deep Learning',
    //         'author' : 'Omar L.',
    //         'url': 'https://www.xataka.com',
    //         'likes': 13
    //     }).toJSON()

    //     blog['userId'] = testUserId

    //     await api
    //         .post('/api/blogs')
    //         .send(blog)
    //         .expect(201)
    //         .expect('Content-Type', /application\/json/)

    //     const blogsAtEnd = await helper.blogsInDb()
    //     expect(blogsAtEnd.length).toBe(blogsAtStart.length + 1)

    //     const blogTitles = blogsAtEnd.map(b => b.title)
    //     expect(blogTitles).toContain(blog.title)

    // })
})


afterAll(() => {
    mongoose.connection.close()
})