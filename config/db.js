require('dotenv').config();
const mongoose = require('mongoose');
require('./../.env')

mongoose.connect(MONGODB_URI,{
    useNewUrlParser: true, 
    useUnifiedTopology:true,
})
.then(() => {
    console.log("DB Connected")
}).catch((err) => console.log(err));