var express=require('express');
var adminroute=require('./routes/admin');
var userroute=require('./routes/user');
var bodyparser=require('body-parser');
var mysql=require('mysql');
var upload=require("express-fileupload");
var util=require("util");
var session=require("express-session");
var app=express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public/"));
app.use(upload());
app.use(session({
    secret:'chavan',
    resave:true,
    saveUninitialized:true
}));
app.use("/",userroute);
app.use("/admin",adminroute);


app.get("/",function(req,res){
    res.send("hello");
});
app.listen(1000);