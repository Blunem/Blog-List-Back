const hist = require('./histogram_helper')

const dummy = (blogs) => {
    return blogs.length === 0 ? 1:1
}

const totalLikes = (blogs) => {
    const cumulativeLikes = (accumulator, currentBlog) => accumulator + currentBlog.likes
    return blogs.reduce(cumulativeLikes,0)
}
const favoriteBlog = (blogs) => {
    const favorite = (favorite, currentBlog) => currentBlog.likes > favorite.likes? currentBlog : favorite
    const clean = (blog) => ({
        title:blog.title,
        author:blog.author,
        likes:blog.likes
    })
    return blogs.length===0? 0 : clean(blogs.reduce(favorite))
}


const mostBlogs = (blogs) => {
    const output = blogs
        .reduce(hist.blogHistogram({ one:'author', two:'blogs' }),[])
        .reduce(hist.maxKey('blogs'),[])
    return blogs.length===0? 0 : output
}

const mostLikes = (blogs) => {
    const output = blogs
        .map(Element => ({ author:Element.author,likes: Element.likes }))
        .reduce(hist.likesHistogram,[])
        .reduce(hist.maxKey('likes'),[])
    return blogs.length===0? 0 : output
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}