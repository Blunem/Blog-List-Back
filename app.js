
const config = require('./utils/config')
const express = require('express')
require('express-async-errors')

const app = express()

const cors = require('cors')
const authRouter = require('./controllers/auth')
const usersRouter = require('./controllers/users')
const blogRouter = require('./controllers/blog')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')


mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })


app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)

app.use('/api/blogs',middleware.userExtractor, blogRouter)
app.use('/api/users',middleware.userExtractor, usersRouter)
app.use('/api/auth', authRouter)

// if (process.env.NODE_ENV === 'test') {
//     const testingRouter = require('./controllers/testing')
//     app.use('/api/testing', testingRouter)
// }

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app