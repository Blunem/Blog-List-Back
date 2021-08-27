
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')


blogRouter.post('/comment/:id/', async (request, response) => {


    const user = await User.findOne({ username : request.user.username })
    let blog = await Blog.findById(request.params.id)

    if(!blog)
        response.status(404).end()

    const comment = new Comment({
        content: request.body.content,
        user: user._id,
        blog: blog._id
    })

    let savedComment = await comment.save()
    blog.comments = blog.comments.concat(savedComment._id)
    await blog.save()

    savedComment = await savedComment.populate('user', {  name: 1 }).execPopulate()
    response.status(200).json(savedComment)
})

blogRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({})
        .populate('comments', { content:1, blog:1, user: 1 } )
        .populate('user', { username:1, name:1 } )
    response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
    const body = request.body
    const user = await User.findById(request.user.id)

    const blog = new Blog({
        title : body.title,
        author : body.author,
        url : body.url,
        user: user._id
    })

    let createdBlog = await blog.save()
    user.blogs = user.blogs.concat(createdBlog._id)
    await user.save()

    createdBlog = await createdBlog.populate('user', { username:1, name: 1 }).execPopulate()
    response.status(201).json(createdBlog.toJSON())
})

blogRouter.get('/:id',async(request,response) => {
    const blog = await Blog.findById(request.params.id)
    blog? response.json(blog.toJSON()) : response.status(404).end()
})

blogRouter.delete('/:id',async(request,response) => {

    const blog = await Blog.findById(request.params.id)

    if(!blog)
        response.status(404).end()

    const user = await User.findOne({ username : request.user.username })

    if(!(blog.user.toString() === user._id.toString()))
        return response.status(401).end()

    await Comment.deleteMany({ blog: blog._id })
    await Blog.findByIdAndDelete(request.params.id)

    user.blogs = user.blogs.filter(b => ( b.toString() !== request.params.id ))
    await user.save()

    response.status(204).end()
})

blogRouter.put('/vote/:id', async (request, response) => {

    const blog = request.body

    if(!blog)
        response.status(400).end()

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { likes: blog.likes }, { new: true })
    updatedBlog? response.status(200).json(updatedBlog) : response.status(404).end()
})

module.exports = blogRouter