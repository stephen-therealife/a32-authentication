//Initial Setup

require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const saltRounds = 10
const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.set('view engine', 'ejs')

mongoose.set('strictQuery', true)
mongoose.connect("mongodb://localhost:27017/userDB")


//MongoDB Schemas and Models

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const User = new mongoose.model("User", userSchema)


//GET requests

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})


//POST requests

app.post("/register", (req, res) => {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash
        })
    
        newUser.save((err) => {
            if (err) {
                console.log(err)
            } else {
                res.render("secrets")
            }
        })
    })

})

app.post("/login", (req, res) => {

    const username = req.body.username
    const password = req.body.password

    User.findOne(
        {email: username},
        (err, foundUser) => {
            if (err) {
                console.log(err)
            } else {
                if (foundUser) {
                    bcrypt.compare(password, foundUser.password, function(err, result) {
                        if (result === true) {
                            res.render("secrets")
                        } else {
                            res.send("Wrong password.")
                        }
                    })
                }
            }
        }
    )

})


//PORT

app.listen(3000, () => {
    console.log("Server started on PORT 3000.")
})