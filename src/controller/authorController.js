const authorModel = require("../model/authorModel")
const jwt = require("jsonwebtoken")


const isValidValue = function(value){   //it should not be like undefined or null.
    if (typeof value === 'undefined' || value === null) return false   //if the value is undefined or null it will return false.
    if (typeof value === 'string' && value.trim().length === 0) return false   //if the value is string & length is 0 it will return false.
    return true
}


const isValidTitle = function(title){    
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1     //enum validation
}

const isValidDetails = function(details){   
    return Object.keys(details).length > 0
}


const createAuthor = async function (req, res) {
    try {
        let data = req.body
        if (!isValidDetails(data)) {
            return res.status(400).send({ status: false, message: "data is missing in body" })
        }
        if (!isValidValue(data.fname)) { return res.status(400).send({ status: false, msg: "fname  is required" }) }
        if (!isValidValue(data.lname)) { return res.status(400).send({ status: false, msg: "lname  is required" }) }
        if (!isValidValue(data.title)) { return res.status(400).send({ status: false, msg: "title  is required" }) }
        if (!isValidValue(data.email)) { return res.status(400).send({ status: false, msg: "email  is required" }) }
        if (!isValidValue(data.password)){ return res.status(400).send({ status: false, msg: "password  is required" }) }

        let validString = /\d/;
        if(validString.test(data.fname)){return res.status(400).send({status:false,msg:" Fname can not contain number"})}
        if(validString.test(data.lname)){return res.status(400).send({status:false,msg:" lname can not contain number"})}

        let email = data.email


        if (!isValidTitle(data.title)) { return res.status(400).send({ status: false, msg: "Use proper title e.g Mr or Mrs or Miss " }) }

        let validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        if (!validEmail.test(email)) {
            return res.status(400).send({ status: false, msg: "please enter email in  correct format  e.g  xyz@abc.com" })
        }
        if (await authorModel.findOne({ email: data.email })) { return res.status(400).send({ status: false, msg: "Email already exits" }) }

        let password = data.password
        validPassword = /^(?!.* )(?=.*[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#!@$%^&*()+=]).{8,15}$/
        if (!validPassword.test(password)) {
            return res.status(400).send({ status: false, msg: "Password must contain 8 to 15 characters and at least one number, one letter and one unique character such as !#$%&? " })
        }


        let authorCreated = await authorModel.create(data)
        res.status(201).send({ status: true, data: authorCreated })
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}




const login = async function (req, res) {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let data = req.body
        if (isValidDetails(data)) {
            return res.status(400).send({ status: false, message: "data is missing in body" })
        }
        if (!isValidValue(email)) { return res.status(400).send({ status: false, msg: "email is required" }) }
        if (!isValidValue(password)) { return res.status(400).send({ status: false, msg: "password is required" }) }
        let validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        if (!validEmail.test(email)) {
            return res.status(400).send({ status: false, message: "please enter email in  correct format" })
        }
        let author = await authorModel.findOne({ email: email, password: password });
        if (!author)
            return res.status(401).send({
                status: false,
                msg: "email or the password is not corerct",
            });

        let token = jwt.sign(
            {
                authorId: author._id,
                batch: "plutonium",
                organisation: "FunctionUp",
            },
            "FunctionUp Group No 63"
        );
        res.setHeader("x-api-key", token);
        res.status(201).send({ status: true, token: token });
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}


module.exports = { createAuthor , login }