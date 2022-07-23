const express = require('express')
const router = express.Router()
//mongodb user model
const User = require('../models/Login')
const bcrypt = require('bcrypt') //password hashing
const PermPublication = require('./../models/PemPublication')
const publication = require('../models/Publications')
const RemovedPublication = require('./../models/RemovedPublications')
const Reimbursment = require('./../models/User')
const num1 = require('./../models/inc')
const addEvnt = require('./../models/Events')
const addFP = require('./../models/FundedProjects')
//const addEvnt = require('./../api/Events')
const jwt = require('jsonwebtoken')
const SECRET_KEY = "SIGNIN_API"





router.post('/signup', (req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    let{name, branch, email, password, dateOfBirth} = req.body
    console.log(req.body)
    console.log("Branch = ",req.body.branch,"\nEmail = ",req.body.email)
    name = name.trim()
    email = email.trim()
    password = password.trim()
    dateOfBirth = dateOfBirth.trim()
    branch = branch.trim()

    if(name == "" || email == "" || password == "" || dateOfBirth == "" || branch == "")
    {
        res.json({
            status: "FAILED",
            message: "Empty input fields"
        });
    }
    else if (!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid name"
        });
    }
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid email"
        }); 
    }
    else if(!new Date(dateOfBirth).getTime()){
        res.json({
            status: "FAILED",
            message: "Invalid Date"
        });
    }
    else if(password.length<8){
        res.json({
            status: "FAILED",
            message: "Password too short"
        });
    }
    else{
        //checking if user already exist
        User.find({email}).then(result =>{
            if(result.length){
                //user already exist
                res.json({
                    status: "FAILED",
                    message: "User already exist"
                })
            }
            else{
                //Try to create new user


                //password handling
                const saltRounds = 10;
                bcrypt.hash(password,saltRounds).then(hashedPassword =>{
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth,
                        branch,
                        type: "F"
                    });
                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Sign Up Successful",
                            data: result
                        });
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while signing you up"
                        });
                    })
                })
                .catch(err =>{
                    res.json({
                        status: "FAILED",
                        message: "Error occured while hashing the password"
                    });
                })
            }
        }).catch(err => {
            console.log(err)
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user"
            })
        })
    }
})

//signin
router.post('/signin', (req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    let{email, password,} = req.body
    email = email.trim()
    password = password.trim()

    if(email== "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty field"
        })
    } else{
        User.find({email})
        .then( data => {
            if (data.length){
                const hashedPassword = data[0].password;
                const token = jwt.sign({
                    email: data[0].email,
                    id: data[0]._id
                }, SECRET_KEY)
                bcrypt.compare(password, hashedPassword).then(result =>{
                    if(result){
                        res.json({
                            status: "SUCCESS",
                            message: "Signin Successful",
                            data: data[0].type,
                            name: data[0].name,
                            branch: data[0].branch,
                            token: token
                        })
                    } else{
                        res.json({
                            status: "FAILED",
                            message: "Invalid password!"
                        })
                    }
                })
                .catch(err =>{
                    console.log(err)
                    res.json({
                        status: "FAILED",
                        message: "An error occured while comparing passwords"
                    })
                    
                })
            }
            else{
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials enterred!"
                })
            }
        })
        .catch(err =>{
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            })
        })  
    }
})

router.post('/viewprofile', (req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    let {name,branch} = req.body
    console.log("View Profile Request",req.body)
    User.find(req.body).then(result =>{
        if(result.length){
            console.log(result)
            let name = result[0].name
             let email = result[0].email
             let branch = result[0].branch
             console.log("Name = ",name,"\nEmail = ",email,'\nBranch = ',branch)
             const requ = {
                "Faculties": {$regex: name}
             }
             console.log(requ)
            PermPublication.find({
                "Faculties": {$regex : name}
            }).then(data =>{
                RemovedPublication.find({Faculties: {$regex: name}}).then(removed =>{
                    if(removed.length)
                {
                    res.json({
                    "status": "SUCCESS",
                    "message": "Faculty details found",
                    "name": name,
                    "email": email,
                    "branch": branch,
                    data,
                    removed
                })
            }
            else{
                res.json(({
                    "status": "SUCCESS",
                    "message": "Faculty details found",
                    "name": name,
                    "email": email,
                    "branch": branch,
                    data
                }))
            }
                })
                console.log(1)
                
            }).catch(err =>{
                console.log(err)
            })
        }
        else{
            res.json({
                "status": "FAILED",
                "message": "No user found"
            })
            
        }
    })
})


router.post('/assignmember', (req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");

    let {name,branch} = req.body
    User.find(req.body).then(result =>{
        if(!result.length)
        {
            res.json({
                "status": "FAILED",
                "message": "Couldn't find the user"
            })
        }else{
            User.findOneAndUpdate(req.body,
                {
                    "type": "M"
                
            }).then(resulting =>{
                
                    
                        res.json({
                            "status": "SUCCESS",
            
                            "message": "Sucessfully appointed "+resulting.name+" as member",
                            "data": resulting
                        })
                    })
        }
    })
    .catch(err =>{
            res.json({
                "status": "FAILED",
                "message": "An error occured",
            })
        })
    })
           
    
router.get('/getFaculties',(req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    User.find({
        type: "F"
    }).then(data =>{
        console.log("Faculties = ",data)
        if(data.length){
            res.json({
                status: "SUCCESS",
                data
            })
        }
        else{
            res.json({
                status: "FAILED"
            })
        }
    })
})    
    



router.post('/add',(req,res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let{Year,Title,Faculties,Type,SubType,Name,Details,ImpactFactor,Affiliated,Branch} = req.body
    console.log(req.body)
    console.log('F =', Faculties)
    
    Title = Title.trim()
    Faculties = Faculties.trim()
    Type = Type.trim()
    SubType = SubType.trim()
    Name = Name.trim()
    Details = Details.trim()
    ImpactFactor = ImpactFactor.trim()
    Affiliated = Affiliated.trim()
    Branch = Branch.trim()
    //checking if the fields are empty
    if(Year == "" ||Title == "" || Faculties == "" || Type == "" || SubType == "" || Name == "" || Details == "" || ImpactFactor == "" || Affiliated == "" || Branch == ""){
        res.json({
            status: "FAILED",
            message: "Empty field"
        });
    }
    else{
        //checking if publication exist
        publication.find({Title}).then(result =>{
            if(result.length)
            {
                res.json({
                    status: "FAILED",
                    message: "Already exist!!!"
                })
            }
            else{
                const newPublication = new publication({
                    Year,Title,Faculties,Type,SubType,Name,Details,ImpactFactor,Affiliated,Branch
                });
                newPublication.save().then(result => {
                    res.json({
                        status: "SUCCESS",
                        message: "Publication Approval Requested!",
                        data: result,
                        //newdata: newPublication
                    });
                })
            }
        })
        
        .catch(err => {
            console.log(err)
            res.json({
                status: "FAILED",
                message: "Error occured while uploading"
            });
        }) 
    }
    
})

router.post('/retrieve', (req,res) =>{
    //let{Title} = req.body
    res.header("Access-Control-Allow-Origin", "*");
    console.log('Request: ',req.body)
    //console.log('Title = ',Title)
    if(req.body == ""){
        res.json({
            status:"FAILED",
            message:"Empty field"
        })
    }
    else{
        //console.log('titke=',Title)
        PermPublication.find(req.body)
        .then( data => {
            console.log(data)
            if (data.length){
                res.json({
                    status: "SUCCESS",
                    message: "Found!!",
                    data
                })
                console.log("Result: ",data)
            }
            else{
                res.json({
                    status: "FAILED",
                    message: "Not found"
                })
            }
        })
    }
})


router.post('/public', (req,res) =>{
    //let{Title} = req.body
    res.header("Access-Control-Allow-Origin", "*");
    console.log('Request: ',req.body)
    //console.log('Title = ',Title)
    if(req.body == ""){
        res.json({
            status:"FAILED",
            message:"Empty field"
        })
    }
    else{
        //console.log('titke=',Title)
        publication.find(req.body)
        .then( data => {
            console.log(data)
            if (data.length){
                res.json({
                    status: "SUCCESS",
                    message: "Found!!",
                    data
                })
                console.log("Result: ",data)
            }
            else{
                res.json({
                    status: "FAILED",
                    message: "Not found"
                })
            }
        })
    }
})

router.get('/sort', (req,res) =>
{
    let {condition} = req.body
    publication.find({}).sort(condition)
    .then(data =>{
        console.log('The data is',data)
        if(data.length){
            res.json({
                status: "SUCCESS",
                message: "Sorted!!",
                data: data
            })
        }
        else{
            res.json({
                status: "FAILED",
                message: "Couldn't Sort"
            }) 
        }
    })
})


router.get('/filter', (req,res) =>
{
   let {time} = req.body
   const d = new Date
   const y = new Date
   console.log(y.getFullYear())
   console.log("Year = ",d.getFullYear()-time)
   console.log("Curr Date = ",d)
   d.setFullYear(d.getFullYear() - time)
   console.log("New Date = ",d)
   publication.find({
    DateOfApproval: {$gt:d, $lt:y}
   }).then(data =>{
    if(data.length){
        res.json({
            status: "SUCCESS",
            message: "Filtered!!",
            data: data
        })
    }
    else{
        res.json({
            status: "FAILED",
            message: "Couldn't Filter"
        }) 
    }
   })
   


    console.log("Request = ",req.body)
    
})



router.post('/verified', (req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    console.log(req.body)
    let {Title,Confirm} = req.body
    console.log(Title)
    Title = Title.trim()
    if(Confirm=="Yes"){
        publication.find({Title})
    .then(data =>{
        if(data.length){
            console.log(data)
            console.log(data[0].Faculties)
            newdata = {
                Faculties: data[0].Faculties,
                Title: data[0].Title,
                Year: data[0].Year,
                Type: data[0].Type,
                SubType: data[0].SubType,
                Name: data[0].Name,
                Details: data[0].Details,
                ImpactFactor: data[0].ImpactFactor,
                Affiliated: data[0].Affiliated,
                Branch: data[0].Branch
            }
            console.log(newdata)
            const newPermpublication = new PermPublication(newdata);
            console.log(newPermpublication)
            newPermpublication.save().then(result =>{   
                res.json({
                    status: "SUCCESS",
                    message: "Publication added to permanent database",
                    data: result
                });
                console.log(Title)
                publication.findOneAndDelete({"Title":data[0].Title}).then(data1 =>
                    {
                        console.log("File\n:",data1)
                    })
                console.log(publication.find())
            })
            
        }
        else{
            res.json({
                status: "FAILED",
                message: "Couldn't Find the given publication"
            })
        }
    })
    }
    else{
        publication.find({"Title": Title}).then(data =>{
            console.log("Inside rejected",data)
            if(data.length){
               
                newdata = {
                    Faculties: data[0].Faculties,
                    Title: data[0].Title,
                    Year: data[0].Year,
                    Type: data[0].Type,
                    SubType: data[0].SubType,
                    Name: data[0].Name,
                    Details: data[0].Details,
                    ImpactFactor: data[0].ImpactFactor,
                    Affiliated: data[0].Affiliated,
                    Branch: data[0].Branch
                }
                console.log("Newdata: ",newdata)
                const newRemovedPublication = new RemovedPublication(newdata)
                console.log("NewRemovedPublication: ",newRemovedPublication)

            newRemovedPublication.save().then(result =>{
                res.json({
                    status: "SUCCESS",
                    message: "Successfully Rejected",
                    data: result
                })
            })
            publication.findOneAndDelete({"Title":Title}).then(data1 =>
                {
                    console.log("File\n:",data1)
                })
            }
            else{
                res.json({
                    status: "FAILED",
                    message: "Publication Not Found"
                })
            }
           
        })
        
    }
    
})



router.post('/reimbursment', (req,res) =>{
    res.header("Access-Control-Allow-Origin","*");
    var x = new Date()
    console.log(x.getTime())
    /*num1.findOneAndUpdate({},{
        
        "num": c+1
      
    }).then(result =>{
      console.log("Updated C value: ",result)
    })*/
    let {studentnames,name,year,totalfee,from,type} = req.body
    console.log("The requested body",req.body)
    studentnames = studentnames.trim()
    name = name.trim()
    year = year
    totalfee = totalfee
    from = from.trim()
    type = type.trim()
    const newReimbursement = new Reimbursment({
        studentnames,
        name,
        year,
        totalfee,
        from,
        type
    });
    newReimbursement.save().then(result =>{
        console.log("Result",result)
        res.json({
            status: "SUCCESS",
            message: "Fee Reimbursement Added"
        })
    })
})

router.get('/return', (req,res) =>{
    res.header("Access-Control-Allow-Origin","*");
    var c 
    var ident
    num1.find({}).then(result =>{
        console.log("C value: ",result)
        c = result[0].num
        console.log("Num: ",c)
        ident = result[0].id
        change = {num: c}
        console.log("Change = ",change)
    
        num1.findOneAndUpdate(change,{num: ++c}).then(incremental =>{
            console.log("C updated", c)
        })
    })  

    /*num1.findOne({}).then(inc1 =>{
        console.log("Data in db ",inc1)
    })*/



    Reimbursment.find({})
    .then(data =>{
        var reimbursed
        //console.log(data)
        console.log(data.length)
        x = data.length
        v = data[x-1]
       // console.log(v)
        console.log("Data: ",data[x-1])
        if(v.from == "NIT" || v.from == "IIT")
        {
            reimbursed = 0.75 * v.totalfee;
        }
        else if(v.from == "GOVT")
        {
            reimbursed = 0.5 * v.totalfee;
        }
        else if(v.from == "PVT")
        {
            reimbursed = 0.25 * v.totalfee;
            if(reimbursed>2000)
                reimbursed = 2000;
        }
        const d = new Date()
        y = d.getFullYear()
        console.log(y)
        const str = "Received with thanks, the amount of Rs"+reimbursed+" towards attending "+v.type+" at "+v.from+" from MITS R&C cell."; 
        console.log(str)
        res.json({
            message: "SUCCESS",
            documentation: str,
            count: c,
            name: v.name,
            year: y
        })
        
    })
    //console.log("The response is:",res)
   

})



router.get('/getAll',(req,res)=>{
    Reimbursment.find({}).then(data =>{
        if(data.length)
        {
            res.json({
                message: "Found",
                length: data.length,
                data
            })
        }
    })
})


/*router.post("/", async (req, res) => {

    //console.log(req.body)
	try {
        
	 	// const { error } = validate(req.body);
        //  //console.log('validatiom')
	 	// if (error)
	 	// return res.status(400).send({ message: error.details[0].message });
        //  console.log(error.details[0].message)
        
        const adttl = await addEvnt.findOne({ eventN: req.body.eventN});
		if (adttl)
		    console.log(req.body)
			return res
				.status(200)
				.send({ data : req.body,message: "Same event "+req.body.eventN+" details already Exist in db!" });
				
        await new addEvnt(req.body).save();
		res.status(201).send({ message: "Event of "+req.body.eventN+"'s details created successfully" });
	} catch (error) {
        console.log(error)
		res.status(500).send({ message: "Internal Server Error" });
	}
});*/


router.post("/AddEvent", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    console.log(req.body)
    console.log(res.header)
	try {
        
	 	// const { error } = validate(req.body);
        //  //console.log('validatiom')
	 	// if (error)
	 	// return res.status(400).send({ message: error.details[0].message });
        //  console.log(error.details[0].message)
        
        addEvnt.find(req.body).then(adttl =>{
            if (adttl.length)
		    {
                console.log(req.body)
			return res
				.status(200)
				.send({ data : req.body,message: "Same event "+req.body.eventN+" details already Exist in db!" });
            }
            else{
                new addEvnt(req.body).save().then(data=>{
                    res.json
                ({ message: "Event of "+req.body.eventN+"'s details created successfully",
                data });
                });
            }     
        });
		
				
       
		
	} catch (error) {
        console.log(error)
		res.json({ message: "Internal Server Error" });
	}
    // try {
    //     addEvnt.find(req.body).then(fail =>{
    //         if(fail.length)
    //         {
    //             res
    //         .json({
    //             message: "Event already exist!!!",
    //         })
    //         .status(200)
    //     }
    //     else{
    //         const eventadd = new addEvnt()
    //         eventadd.save({
    //             eventN: req.body.eventN,
    //             venue: req.body.venue,
    //             org: req.body.org,
    //             date:req.body.data,
    //             time:req.body.time
    //         }).then(data =>{
    //             console.log("Saving....",data)
    //             res.json({
    //                 message: "Event of details created successfully"
    //             })
    //         })
    //     }
    //     })
    
        
    // } catch (error) {
    //     console.log(error)
    //     res.json({
    //         message: "Internal server error"
    //     })
    // }
    

});


router.post("/addFP", async (req, res) => {
    console.log(req.body.name)
	try {
        const adttl = await addFP.findOne({ title: req.body.title});
		if (adttl)
			return res
				.status(409).send({ message: "Same Title already Exist!" });
                
        await new addFP(req.body).save().then(data=>{
            res.status(201).send({ message: "Funded project details created successfully" });
        });
		
	} catch (error) {
        console.log(error)
		res.status(500).send({ message: "Internal Server Error" });
	}
});

router.get('/getEvents',(req,res) =>{
    addEvnt.find({}).then(data =>{
        if(data.length)
        {
            res.json({
                message: "Found",
                length: data.length,
                data
            })
        }
    })
})
   

module.exports = router