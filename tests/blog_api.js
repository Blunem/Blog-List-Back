const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')


describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})

        for (let blog of helper.initialBlogs) {
            let blogObject = new Blog(blog)
            await blogObject.save()
        }
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs were returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('the first blog is about IoT development', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].title).toBe('IoT')
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')
        const contents = response.body.map(r => r.title)
        expect(contents).toContain(
            'Machine Learning'
        )
    })

    test('the id property is not defined as _id',async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToView = blogsAtStart[0]
        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type',/application\/json/)

        expect(resultBlog.body.id).toBeDefined()
    })

    describe('viewing a specific blog', () => {
        test('succeeds with a valid id ',async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToView = blogsAtStart[0]
            const resultBlog = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect('Content-Type',/application\/json/)

            const processedBlogToView = blogToView
            expect(resultBlog.body).toEqual(processedBlogToView)
        })

        test('fails with statuscode 404 if note does not exist',async() => {
            const testId = await helper.nonExistingId()
            await api
                .get(`/api/blogs/${testId}`)
                .expect(404)
        })

        test('fails with statuscode 400 if id is not valid',async() => {
            const testId = 'someInvalidId'
            await api
                .get(`/api/blogs/${testId}`)
                .expect(400)
        })
    })

    describe('deletion of a blob', () => {

        test('a specific blog can be deleted',async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
        })

        test('fails with statuscode 400 if id is not valid',async() => {
            const testId = 'someInvalidId'
            await api
                .delete(`/api/blogs/${testId}`)
                .expect(400)
        })
    })

    describe('updating a blog', () => {
        test('a specific blog can be updated', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = { ...blogsAtStart[0],likes:101 }

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(blogToUpdate)
                .expect(204)

            const blogsUpdated = await helper.blogsInDb()
            expect(blogsUpdated[0].likes).toBe(blogToUpdate.likes)
        })

        test('fails with statuscode 400 if id is not valid',async() => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = { ...blogsAtStart[0],likes:101 }

            const testId = 'someInvalidId'
            await api
                .put(`/api/blogs/${testId}`)
                .send(blogToUpdate)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd[0].likes).toBe(blogsAtStart[0].likes)
        })
    })
})


afterAll(() => {
    mongoose.connection.close()
})