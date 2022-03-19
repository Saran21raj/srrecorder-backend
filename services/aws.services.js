const AWS = require('aws-sdk');;
const db=require("../mongo");
const ACCESS_ID=process.env.AWS_ACCESS_ID;
const ACCESS_KEY=process.env.AWS_ACCESS_KEY;
const REGION=process.env.AWS_REGION;
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const services=
  {
    async awsUpload(req,res){
      const user=await db.users.findOne({emailId: req.body.emailId});
      const directoryName=user.directoryName
      res.send(directoryName);
    },
    async awsList(req,res){
      const user=await db.users.findOne({emailId: req.body.emailId});
      const directoryName=user.directoryName
      AWS.config.update({region: REGION});
      const s3 = new AWS.S3({
        accessKeyId: ACCESS_ID,
        secretAccessKey: ACCESS_KEY
      });
      const params = {
        Bucket:BUCKET_NAME,
        Delimiter: '/',
        Prefix:`${directoryName}/`,
      };
      s3.listObjectsV2(params,function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data); res.send(data)           // successful response
      });
    },
    async awsDelete(req,res){
      // Helper function that creates Amazon S3 service client module.
      AWS.config.update({region: REGION});
      const s3 = new AWS.S3({
        accessKeyId: ACCESS_ID,
        secretAccessKey: ACCESS_KEY
      });
      const params = {
        Bucket:BUCKET_NAME,
        Key:`${req.body.name}`
      };
      s3.deleteObject(params, function(err, data) {
        if (err) console.log(err);  // error
        else     console.log(data); res.send(data);                 // deleted
      });
      // console.log(req.body);
    }
}
module.exports=services;