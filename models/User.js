const { default: mongoose } = require("mongoose");


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    isValuationFeePaid:{
        type:Boolean,
        required:true
    },
    isUkResident:{
        type:Boolean,
        required:true
    },
    riskRating:{
        type:String,
        required:true
    },
     ltv:{
        type:Number,
        required:true
    },
})

const UserModel = mongoose.models.user || mongoose.model("user",userSchema)
module.exports = UserModel;