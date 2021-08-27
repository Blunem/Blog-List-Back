const listHelper = require('../utils/list_helper')
const data = require('../utils/test_data')
const answers = require('../utils/test_answers')

describe('Dummy Function', () => {
    test('dummy returns one', () => {
        const result = listHelper.dummy(data.empty)
        expect(result).toBe(1)
    })
})

describe('Total Likes', () => {
    test('of an empty list is zero', () => {
        const result = listHelper.totalLikes(data.empty)
        expect(result).toBe(0)
    })

    test('when list has only one blog, equals the likes of that', () => {
        const result = listHelper.totalLikes(data.oneBlog)
        expect(result).toBe(5)
    })

    test('of a bigger list was calculated right', () => {
        const result = listHelper.totalLikes(data.allBlogs)
        expect(result).toBe(36)
    })
})

describe('Favorite Blog', () => {

    test('of an empty list is zero', () => {
        const result = listHelper.favoriteBlog(data.empty)
        expect(result).toBe(0)
    })

    test('when list has only one blog, equals the likes of that', () => {
        const result = listHelper.favoriteBlog(data.oneBlog)
        expect(result).toEqual(answers.oneBlog)
    })

    test('of a bigger list was determined right', () => {
        const result = listHelper.favoriteBlog(data.allBlogs)
        expect(result).toEqual(answers.allBlogs)
    })
})

describe('Most blogs', () => {

    test('of an empty list is zero', () => {
        const result = listHelper.mostBlogs(data.empty)
        expect(result).toBe(0)
    })

    test('when list has only one blog, equals to the same author with blog = 1', () => {
        const result = listHelper.mostBlogs(data.oneBlog)
        expect(result).toEqual({ author: 'Edsger W. Dijkstra', blogs: 1 })
    })

    test('of a bigger list was determined right', () => {
        const result = listHelper.mostBlogs(data.allBlogs)
        expect(result).toEqual({ author: 'Robert C. Martin', blogs: 3 })
    })
})


describe('Most likes', () => {

    test('of an empty list is zero', () => {
        const result = listHelper.mostLikes(data.empty)
        expect(result).toBe(0)
    })

    test('when list has only one blog, equals to an object with the input author-and-like values', () => {
        const result = listHelper.mostLikes(data.oneBlog)
        expect(result).toEqual({ author: 'Edsger W. Dijkstra', likes: 5 })
    })

    test('of a bigger list was determined right', () => {
        const result = listHelper.mostLikes(data.allBlogs)
        expect(result).toEqual({ author: 'Edsger W. Dijkstra', likes: 17 })
    })
})