const db=require("../mongo");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const AWS = require('aws-sdk');;
const REGION=process.env.AWS_REGION;
const ACCESS_ID=process.env.AWS_ACCESS_ID;
const ACCESS_KEY=process.env.AWS_ACCESS_KEY;
const BUCKET_NAME=process.env.AWS_BUCKET_NAME;
const JWT_KEY=process.env.JWT_SECRET_KEY;
const services={
    async signup(req,res)
    {
        try
        {   //Request body validation
            //Checking wheather email id already exits
            const user=await db.users.findOne({emailId: req.body.emailId});
            if(user){
                return res.status(400).send();
            }
            else
            {
                // Encrypting password with genSalt and hash
                const salt=await bcrypt.genSalt(10)
                req.body.password=await bcrypt.hash(req.body.password,salt);
                //  inserting new data
                await db.users.insertOne(req.body);
                AWS.config.update({region: REGION});
                const s3 = new AWS.S3({
                    accessKeyId: ACCESS_ID,
                    secretAccessKey: ACCESS_KEY
                });
                const params = {
                    directoryName: `${req.body.firstName}sr`,
                };
                s3.listObjects({Bucket: BUCKET_NAME}, function(err, data) {
                    if (err) {
                        // console.log(err);
                    }
                    else
                    {
                        const bucket=data.Contents;
                        bucket.forEach(function (arr){
                            let name=arr.Key.slice(0,-1);
                            if(name==params.directoryName){
                                params.directoryName=`${params.directoryName}1`
                            }
                        })
                        s3.putObject({Key:`${params.directoryName}/`, Bucket: BUCKET_NAME}, function(err, data) {
                            if (err) {
                                // console.log(err);
                            } 
                            else
                            {
                                console.log(data);
                                db.users.updateOne({"emailId":req.body.emailId},{$set:{"directoryName":params.directoryName}})
                            }
                        });
                    }
                });
                res.send({mes:"User Registered Successfully"})
            }
        }
        catch(err)
        {
            // console.log("Error Registering User",err);
            res.sendStatus(500);
        }
    },
    async signin(req,res)
    {
        try
        {
            // Checking wheather user exists or not
            const user=await db.users.findOne({emailId: req.body.emailId});
            if(!user){
                return res.status(400).send({error:"User Doesn't Exits"});
            }
            const isValid= await bcrypt.compare(req.body.password,user.password);
            if(!isValid)
                return res.status(403).send({error:"Email & Password Doesnt match"})

                const token=jwt.sign({userId: user._id},JWT_KEY);
                // console.log(token);
                // const details=jwt.verify(token,process.env.JWT_SECRET_KEY);
                const firstName=user.firstName;
                const emailId=user.emailId;
                res.send({token,firstName,emailId});
            
        }
        catch(err)
        {
            // console.log("Error Inserting Data",err);
            res.sendStatus(500);
        }
    }
}

module.exports=services;