const route=require("express").Router();

const services=require("../services/users.services")
    route.post("/signup",services.signup);
    route.post("/signin",services.signin);
    module.exports=route;