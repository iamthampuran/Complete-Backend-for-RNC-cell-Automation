require('dotenv').config();
const mongoose = require('mongoose');
//require('./../.env')

mongoose.connect("mongodb+srv://Amogh:ASTDB@cluster0.myclosi.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser: true, 
    useUnifiedTopology:true,
})
.then(() => {
    console.log("DB Connected")
}).catch((err) => console.log(err));