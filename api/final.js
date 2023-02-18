const express = require('express')
const router = express.Router()
//mongodb user model
const User = require('../models/Login')
//const bcrypt = require('bcrypt') //password hashing
const PermPublication = require('./../models/PemPublication')
const publication = require('../models/Publications')
const RemovedPublication = require('./../models/RemovedPublications')
const Reimbursment = require('./../models/User')
const num1 = require('./../models/inc')
const addEvnt = require('./../models/Events')
const addFP = require('./../models/FundedProjects')
const mailsender = require('./../models/mailsender')
//const addEvnt = require('./../api/Events')
const jwt = require('jsonwebtoken')
const SECRET_KEY = "SIGNIN_API"
const bcrypt = require('bcryptjs')
const sgMail = require('@sendgrid/mail')
const nodemailer = require("nodemailer");

//sgMail.setApiKey(process.env.SENDGRID_API_KEY)




router.post('/signup', (req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    let{name, branch, email, password, OCRid} = req.body
    console.log(req.body)
    console.log("Branch = ",req.body.branch,"\nEmail = ",req.body.email)
    name = name.trim()
    email = email.trim()
    password = password.trim()
    OCRid = OCRid.trim()
    branch = branch.trim()

    if(name == "" || email == "" || password == "" || OCRid == "" || branch == "")
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
    // else if(!new Date(dateOfBirth).getTime()){
    //     res.json({
    //         status: "FAILED",
    //         message: "Invalid Date"
    //     });
    // }
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

                    const newUser = new User({
                        name,
                        email,
                        password: password,
                        OCRid   ,
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
                const token = jwt.sign({
                    email: data[0].email,
                    id: data[0]._id
                }, SECRET_KEY)
                    if(password == data[0].password){
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

router.post('/viewprofileapp', (req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    let {name,branch} = req.body
   // console.log(req.body)
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
                PermPublication.find({Faculties: {$regex: name}}).then(approved =>{
                    console.log(approved.length)
                    console.log(approved)
                    if(approved.length)
                {
                    res.json({
                    "status": "SUCCESS",
                    "message": "Faculty details found",
                    "name": name,
                    "email": email,
                    "branch": branch,
                    approved
                })
            }
                
            else{
                res.json(({
                    "status": "FAILED",
                        "message": "Faculty details not found"
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


router.post('/viewprofilereject', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let { name, branch } = req.body
    console.log("View Profile Request", req.body)
    User.find(req.body).then(result => {
        if (result.length) {
            let name = result[0].name
            let email = result[0].email
            let branch = result[0].branch
            console.log("Name = ", name, "\nEmail = ", email, '\nBranch = ', branch)
            const requ = {
                "Faculties": { $regex: name }
            }
            console.log(requ)
            RemovedPublication.find({ Faculties: { $regex: name } }).then(removed => {
                console.log(removed.length)
                console.log(removed)
                if (removed.length) {
                    res.json({
                        "status": "SUCCESS",
                        "message": "Faculty details found",
                        "name": name,
                        "email": email,
                        "branch": branch,
                        removed
                    })
                }
                else {
                    res.json({
                        "status": "FAILED",
                        "message": "Faculty details not found"
                    })
                }
            })
        }
        else {
            res.json({
                "status": "FAILED",
                "message": "Faculty details not found"
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

    router.post('/remove', (req,res) =>{
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
                        "type": "F"
                    
                }).then(resulting =>{
                    
                        
                            res.json({
                                "status": "SUCCESS",
                
                                "message": "Sucessfully removed "+resulting.name+" as member",
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

router.get('/getMember',(req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    User.find({
        type: "M"
    }).then(data =>{
        console.log("Members = ",data)
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
    let{Year,Title,Faculties,Type,SubType,Name,Details,ImpactFactor,Affiliated,Branch,AcademicYear} = req.body
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
    AcademicYear = AcademicYear.trim()
    var mailer,password
    mailsender.findOne({}).then(data =>{
        // console.log(data.email,data.password)
         mailer = data.email
         password = data.password
    })
    //checking if the fields are empty
    if(AcademicYear == "" ||Title == "" || Faculties == "" || Type == "" || SubType == "" || Name == "" || Details == "" || ImpactFactor == "" || Affiliated == "" || Branch == ""){
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
                    message: `The title ${Title} Already exist!!!`
                })
            }
            else{
                const newPublication = new publication({
                    AcademicYear,Title,Faculties,Type,SubType,Name,Details,ImpactFactor,Affiliated,Branch
                });
                newPublication.save().then(result => {
                   
           //console.log(user)
           
           User.findOne({
            type: "M",branch:"CSE"
        }).then(data1 =>{
            
            console.log("Members = ",data1)
            if(data1){
                console.log(data1.email)

                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                      user: mailer, // generated ethereal user
                      pass: password, // generated ethereal password
                    },
                  });
                
                  // send mail with defined transport object
                  let info =transporter.sendMail({
                    from: "RNCAdmin", 
                    to: data1.email, // list of receivers
                    subject: "Received approval request ", // Subject line
                    text: `Hey ${data1.name}(RNC Member),\n\n A Publication Approval was Requested.\nTitle : ${Title}\n by Faculty : ${Faculties} of ${Branch} Department.\nPlease check the website to approve or reject it.\n\n\n Regards,\n RNC Admin,MITS`  // plain text body
                    
                  })
      .then(() => {
        console.log('Email sent')
        res.json({
            status: "SUCCESS",
            message: "Publication Approval Requested!\nmail sent",
            data: result,
            //newdata: newPublication
        })
        })
                
            }
            else{
                res.json({
                    status: "FAILED"
                })
            }
        })

       
  .catch((error) => {
    console.error("mail errrr"+error)
    res.json({
        status: "SUCCESS",
        message: "Publication Approval Requested!\nnot  mail sent ",
        data: result,
        //newdata: newPublication
    })
  })

//   res.json({
//     status: "SUCCESS",
//     message: "Publication Approval Requested!\n",
//     data: result,
//     //newdata: newPublication
// })
             
        
        .catch(err => {
            console.log(err)
            res.json({
                status: "FAILED",
                message: "Error occured while uploading"
            });
        }) 
    } )
    
}
})}})


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
                    message: "Publication details Found!!",
                    data
                })
                console.log("Result: ",data)
            }
            else{
                res.json({
                    status: "FAILED",
                    message: "Publication details not found"
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


router.post('/filter', (req,res) =>
{
   let {time} = req.body
   const d = new Date
   const y = new Date
   console.log(y.getFullYear())
   console.log("Year = ",d.getFullYear()-time)
   console.log("Curr Date = ",d)
   d.setFullYear(d.getFullYear() - time)
   console.log("New Date = ",d)
   PermPublication.find({
    Year: {$gt:d.getFullYear(), $lt:y.getFullYear()}
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
            message: "No matching results"
        }) 
    }
   })
   


    console.log("Request = ",req.body)
    
})



router.post('/verified', (req,res) =>{
    res.header("Access-Control-Allow-Origin", "*");
    var mailer,password,adminMail

    mailsender.findOne({}).then(data =>{
        // console.log(data.email,data.password)
         mailer = data.email
         password = data.password
         adminMail =data.admin_Mail

    })
    console.log(mailer,password,adminMail)
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
                AcademicYear: data[0].AcademicYear,
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
                
                console.log(Title)
                publication.findOneAndDelete({"Title":data[0].Title}).then(data1 =>
                    {
                        console.log("File\n:",data1)
                    })
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        auth: {
                          user: mailer, // generated ethereal user
                          pass: password, // generated ethereal password
                        },
                      });
                    
                      // send mail with defined transport object
                      transporter.sendMail({
                        from: "RNC Admin", 
                        to: adminMail, // list of receivers
                        subject: "Publication Details Accepted ", // Subject line
                        text: `Hey RNC Admin, \n\n Publication approval request is accepted by RNC Member.\n Title :${newdata.Title}\nby Faculty : ${newdata.Faculties} of ${newdata.Branch} Department.\n\n\n Regards,\n RNC Cell,MITS`  // plain text body
                        
                      })
          .then(() => {
            //console.log('Email sent')
            res.json({
                status: "SUCCESS",
                message: "Publication added to permanent database\n Email sent to admin",
                data: result
            });
          })
          .catch((error) => {
            console.error(error)
          })
                // console.log(publication.find())
                console.log(mailer,password)
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
                    AcademicYear: data[0].AcademicYear,
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
    let {studentnames,name,year,totalfee,reimbursed,from,type,institute,branch} = req.body
    console.log("The requested body",req.body)
    studentnames = studentnames.trim()
    name = name.trim()
    year = year
    totalfee = totalfee
    reimbursed = reimbursed
    from = from.trim()
    type = type.trim()
    branch = branch
    institute = institute
    if(studentnames==""|| name == ""|| year == 0|| totalfee == 0|| from == "" || type == ""|| institute == "" || branch == "")
        res.json({
            status: "FAILED",
            message: "Missing fields"
        })
    else{
        const newReimbursement = new Reimbursment({
            studentnames,
            name,
            year,
            totalfee,
            reimbursed,
            from,
            type,
            institute,
            branch
        });
        newReimbursement.save().then(result =>{
            console.log("Result",result)
            res.json({
                status: "SUCCESS",
                message: "Fee Reimbursement Added"
            })
        }
        
        )
    }
        
})

router.get('/return', (req,res) =>{
    res.header("Access-Control-Allow-Origin","*");
    var c 
    var ident
    const d3 = new Date()
    var x = d3.getFullYear()

    num1.find({}).then(result =>{
        console.log("C value: ",result)
        c = result[0].num
        console.log("Num: ",c)
        ident = result[0].id
        change = {num: c}
        console.log("Change = ",change)

        if(x!=result[0].year)
        {
            num1.findOneAndUpdate(change,{num:0,year: x}).then(update =>{
                console.log("Year Updated",year)
            })
        }
    
        num1.findOneAndUpdate(change,{num: ++c}).then(incremental =>{
            console.log("C updated", c)
        })
        Reimbursment.find({})
    .then(data =>{
        var reimbursed
        //console.log(data)
        console.log(data.length)
        x = data.length
        v = data[x-1]
       // console.log(v)
        console.log("Data: ",data[x-1])
        reimbursed = v.reimbursed
        const d = new Date()
        y = d.getFullYear()
        console.log(y)
        console.log("Count = ",c)
        const str = "Received with thanks, the amount of Rs "+reimbursed+"/- towards attending "+v.type+" at "+v.institute+" from MITS R&C cell."; 
        console.log(str)
        res.json({
            message: "SUCCESS",
            documentation: str,
            count: c,
            name: v.name,
            year: y,
            branch:v.branch
        })
        console.log("Response:",res.count)
    })
    //console.log("The response is:",res)
   

})
    })  

    /*num1.findOne({}).then(inc1 =>{
        console.log("Data in db ",inc1)
    })*/



    



router.get('/getAll',(req,res)=>{
    Reimbursment.find({}).then(data =>{
        if(data.length)
        {
            // console.log(data)
            const usefuldetails = data.map(detail =>({Student_Names: detail.studentnames,Faculty_name: detail.name,Fee_Reimbursed: detail.reimbursed,Amount_Spent: detail.totalfee,Department: detail.branch,'Type of the program' : detail.type,Year: detail.year,'Type of institute': detail.from,'Name of institute': detail.institute}))
             console.log(usefuldetails)
            res.json({
                message: "Found",
                length: data.length,
                usefuldetails
            })
        }
        else
        {
            res.json({
                "message": "Fail"
            })
        }
    })
})



router.post("/AddEvent", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    console.log(req.body)
    console.log(res.header)
	try {
        
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
                ({ message: "Event of "+req.body.Event_Name+"'s details created successfully",
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
    console.log(req.body)
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
            const usefuldetails = data.map(detail=>({Venue: detail.Venue,Event_Name: detail.Event_Name,Oraganisation: detail.Organisation,Date: detail.Date,Time: detail.Time,Branch: detail.Branch,Source: detail.Source}))
                    console.log(usefuldetails)
            res.json({
                message: "Found",
                length: data.length,
                usefuldetails
            })
        }
    })
})

router.post('/getFP',(req,res) =>{
    console.log(req.body)
    res.header("Access-Control-Allow-Origin", "*");
    addFP.find(req.body).then(data =>{
        if(data.length)
        {
            const usefuldetails = data.map(detail=>({Title: detail.title,Academic_Year: detail.AcademicYear,Agency: detail.agency,Department: detail.dept,'Name & designation of PI/CO PI': detail.name,Branch: detail.Branch,sector: detail.GoP,Amount:detail.amount,Type: detail.type,status: detail.status}))
                    console.log(usefuldetails)
            console.log(data)
            res.json({
                message: "Found",
                length: data.length,
                usefuldetails
            })
        }
    })
})
   

router.post('/forgot-password', (req, res) => {
    // Find the user in the database by email
    res.header("Access-Control-Allow-Origin", "*");
    var mailer,password
    mailsender.findOne({}).then(data =>{
        // console.log(data.email,data.password)
         mailer = data.email
         password = data.password
    })
    console.log(mailer,password)
    let mail = req.body
    User.findOne( mail , (err, user) => {
        console.log(req.body.email)
        
        if (err) {
            res.status(500).send('Error finding user')
        } else if (!user) {
            res.status(404).send('User not found')
        } else {
            // Send the password to the user's email address
            console.log(user)
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                  user: mailer, // generated ethereal user
                  pass: password, // generated ethereal password
                },
              });
            
              // send mail with defined transport object
              let info =transporter.sendMail({
                from: "RNC Admin", 
                to: user.email, // list of receivers
                subject: "Forgot Password ", // Subject line
                text: `Hey ${user.name}\nYour password is: ${user.password}`  // plain text body
                
              })
  .then(() => {
    console.log('Email sent')
    res.json({
        message: "Mail sent"
    })
  })
  .catch((error) => {
    console.error(error)
  })
        }
    })
})





module.exports = router