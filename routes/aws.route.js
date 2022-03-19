const route=require("express").Router();

const services=require("../services/aws.services")
    route.post("/upload",services.awsUpload);
    route.post("/list",services.awsList);
    route.delete("/delete",services.awsDelete);
    module.exports=route;