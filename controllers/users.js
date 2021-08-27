
const usersRouter = require('express').Router()
const User  = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs',{ id:1 })
    response.json(users)
})


module.exports = usersRouter







// const validCharacter = /^[a-zA-Z0-9!@#%]+$/  // should contain valid characters
// const oneDigitValidator = /\d/          // should contain at least one digit
// const lowerCaseValidator = /[a-z]/      // should contain at least one lower case
// const upperCaseValidator = /[A-Z]/      // should contain at least one upper case
// const specialValidator = /[!@#%&$]/     // should contain at least one special character


// const passwordValidator = (password) =>  {

//   let validation = { valid: true, error: [] }

//   if(!password)
//     return { valid: false, error:['empty password'] }

//   if(!validCharacter.test(password))
//     return { valid: false, error:['Non valid characters found'] }


//   if(!oneDigitValidator.test(password)){
//     validation.valid = false
//     validation.error = validation.error.concat('should contain at least one digit')
//   }
//   if(!lowerCaseValidator.test(password)){
//     validation.valid = false
//     validation.error = validation.error.concat('should contain at least one lowercase')
//   }
//   if(!upperCaseValidator.test(password)){
//     validation.valid = false
//     validation.error = validation.error.concat('should contain at least one uppercase')
//   }
//   if(!specialValidator.test(password)){
//     validation.valid = false
//     validation.error = validation.error.concat('should contain at least one special characer')
//   }
//   if(!(password.length >= 8) ){
//     validation.valid = false
//     validation.error = validation.error.concat('should contain at least 8 characters')
//   }

//   return validation
// }

// module.exports = passwordValidator