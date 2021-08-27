const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const authRouter = require('express').Router()
const User =require('../models/user')

authRouter.post('/register', async (request, response) => {
    const body = request.body

    if(!(body.username && body.password && body.name)){
        return response.status(400).json({
            error: 'Missing data'
        })
    }

    // const validUsername = ((/^(?!.*[-_]{2,})(?=^[^-_].*[^-_]$)[\w\s-]{3,9}$/).test(body.username))
    const validPassword = ((/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).test(body.password))

    if(!(validPassword)){
        return response.status(400).json({
            error: 'Invalid password'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash: passwordHash
    })

    const savedUser = await user.save()

    response.json(savedUser)
})


authRouter.post('/login', async(request, response) => {
    const body = request.body

    if(!(body.username && body.password)){
        return response.status(400).json({
            error: 'missing user or password'
        })
    }
    const user = await User.findOne({ username:body.username })
    const passwordCorrect = (user===null)? false : await bcrypt.compare(body.password,user.passwordHash)

    if(!(user && passwordCorrect)){
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }
    // token expires in 60*60 seconds, that is, in one hour
    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*10 })

    response
        .status(200)
        .send(
            {
                token,
                username: user.username,
                name: user.name,
                id:user.id
            }
        )
})

module.exports = authRouter