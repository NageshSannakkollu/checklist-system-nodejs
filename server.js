const express = require("express")
const port = 3007;
const app = express()
const axios = require("axios")
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const User = require("./models/User")

//middleware
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.set('view engine','ejs')

app.use(express.static('public'));

const url = "http://qa-gb.api.dynamatix.com:3100/api/applications/";
app.listen(port,(() => {
    console.log(`Server Running at:http://localhost:${port}/`)
}))

//DB Connection

mongoose.connect('mongodb://localhost:27017/checklistSystem',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
 

const rules = [
    {
        id:'isValuationFeePaid  ',
        label:"Fee Paid",
        check:(user) => user.isValuationFeePaid
    },
    {
        id:'isUkResident',
        label:"UK Resident",
        check:(user) => user.isUkResident
    },
    {
        id:'riskRating',
        label:"Risk Rating(Medium)",
        check:(user) => user.riskRating ==='Medium'|| 'Low'||'High'
    },
    {
        id:'ltv',
        label:"LTV Below 60%",
        check:(user) => parseInt(user.ltv)<60
    },
];

async function fetchedData(url){
    try {
        const response = await axios.get(url)
        const data = response.data 
        return data;
    } catch (error) {
        console.log(error)
        return [];
    }
}
//Get All users data

app.get("/",async(request,response) => {
    const users = await fetchedData(url)
    const results = users.map((user) => {
        const checks = rules.map((rule) => ({
            rule:rule.label,
            status:rule.check(user)
        }));
        // console.log("User:",user)
        // console.log("Checks:",checks)
        return({user,checks})
    });
    // console.log(results)
    response.render('dashboard',{results})
})


app.get("/add-user",async(request,response) => {
    response.sendFile(__dirname+'/views/addUser.html')
})

//Add User 
app.post("/add-user",async(request,response) => {
    const {username,isValuationFeePaid,isUkResident,riskRating,purchasePrice,loanRequired} = request.body;
    const riskTitleCase = riskRating[0].toUpperCase()+riskRating.slice(1)
    // console.log(titleCase)
    const calculateLtv=Math.round((loanRequired/purchasePrice)*100)
    // console.log(calculateLtv)

    const newUser = new User({username,isValuationFeePaid,isUkResident,riskRating:riskTitleCase,ltv:calculateLtv})
    await newUser.save();
    response.redirect("/")
})  

//Get all Users from Mongodb

app.get("/all-users",async(req,res) => {
    const getAllUsers = await User.find()
    // res.send(getAllUsers)
    res.render('userList',{getAllUsers})
})

//Get update details

app.get("/update-user/:id",async(req,res) => {
    const {id} = req.params;
    const getSingleUserUrl = `${url}getApplicationById/${id}`
    // console.log(getSingleUserUrl)
    const users = await fetchedData(getSingleUserUrl)
    const arrayUsers = [users]
    // console.log(typeof arrayUsers)
     const results = arrayUsers.map((user) => {
     const checks = rules.map((rule) => ({
            rule:rule.label,
            status:rule.check(user)
        }));
        return({user,checks})
    });
    // res.send(results)
    res.render('updateUser',{results})
})

//Update User with specific Id

app.post("/user-update/:id",async(req,res) => {
    const {id} = req.params;
    console.log("ID:",id)
    console.log("Update Clicked")
    const userUpdateDetails = req.body;
    console.log("User Update Details:",userUpdateDetails)
    res.redirect("/")
})

//Delete Specific User 

app.post("/delete-user/:id",async(req,res) => {
    try {
        const {userId} = req.params;
    console.log(userId)
    res.redirect("/")
    } catch (error) {
        console.log("Error:",error)
    }
})