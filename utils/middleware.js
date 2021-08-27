const logger = require('./logger')
const jwt = require('jsonwebtoken')



const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const tokenExtractor = (request, response, next) => {
    const getTokenFrom = (request) => {
        const authorization = request.get('authorization')
        const validToken = authorization && authorization.toLowerCase().startsWith('bearer')
        return validToken? authorization.substring(7) : null
    }
    request.token = getTokenFrom(request)
    next()
}


const userExtractor = (request, response, next) => {
    const decodedToken = (req) => jwt.verify(req.token, process.env.SECRET)
    if(!request.token){
        let error = new Error('unauthorized')
        error.name = 'JsonWebTokenError'
        throw error
    }
    const userdata = decodedToken(request)
    request.user = { username: userdata.username, id: userdata.id }
    next()

}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name ==='JsonWebTokenError'){
        return response.status(401).json({ error: 'invalid token' })
    } else if (error.name ==='TokenExpiredError'){
        return response.status(401).json({ error: 'expired token' })
    }
    next(error)
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}