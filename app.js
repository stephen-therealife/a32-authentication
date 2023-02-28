//Initial Setup

require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.set('view engine', 'ejs')

//Special session for using Passport.js

app.use(session({
    secret: "ASecretKeyThatWeUse",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

////

mongoose.set('strictQuery', true)
mongoose.connect("mongodb://localhost:27017/userDB")


//MongoDB Schemas and Models

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose) // <=== Adding this plugin for using Passport
const User = new mongoose.model("User", userSchema)
passport.use(User.createStrategy()) // <=== Add this line of code to use Passport
passport.serializeUser(User.serializeUser()) // <=== Add this line of code to use Passport
passport.deserializeUser(User.deserializeUser()) // <=== Add this line of code to use Passport


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

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
})

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (!err) {
            res.redirect("/")
        }
    })
})

//POST requests

app.post("/register", (req, res) => {

    const submittedUsername = req.body.username
    const submittedPassword = req.body.password

    User.register({username: submittedUsername}, submittedPassword, function(err, user) {
        if (err) {
            console.log(err)
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets")
            })
        }
    })

})

app.post("/login", (req, res) => {

    const loginUser = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(loginUser, function(err) {
        if (err) {
            console.log(err)
            res.redirect("/login")
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets")
            })
        }
    })

})


//PORT

app.listen(3000, () => {
    console.log("Server started on PORT 3000.")
})