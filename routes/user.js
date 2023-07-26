var express=require("express");
var exe=require("./connection");
var router=express.Router();
router.use(express.static('public/'))
function login(req){
 if(req.session.user_id==undefined)
    return false;
 else
    return true;
}
function getDate()
{
   var today=new Date();
   var date=(today.getDate() < 10)? "0"+today.getDate():today.getDate();
   var month=(today.getMonth()+1 < 10)? "0"+(today.getMonth()+1):today.getMonth()+1;
   var year=today.getFullYear();
   return (year+"-"+month+"-"+date);
}

router.get("/", async function(req,res){
    var slides=await exe(`select * from slider`);
    var courses=await exe(`select * from course order by course_id desc limit 8`);
    obj={"slides":slides,"courses":courses,"login":login(req)}; 
    res.render("user/home.ejs",obj);
});
router.get("/course_details/:id",async function(req,res){
    var id=req.params.id;
    var course_det=await exe(`select * from course where course_id='${id}'`);
    var is_purchase=false;
     if(login(req))
     {
      var user_id=req.session.user_id;
      var user_courses=await exe(`select * from user_courses where course_id='${id}' and user_id='${user_id}'`);
      if(user_courses.length >0)
      {
         var is_purchase=true;
      }
     }

    var obj={"course_det":course_det[0],"login":login(req),"is_purchase":is_purchase};
   res.render("user/course_details.ejs",obj)
});
router.get("/courses",async function(req,res){
    var courses=await exe(`select * from course`);
    var obj={"courses":courses,"login":login(req)};
   res.render("user/courses.ejs",obj)
});
router.get("/login",async function(req,res){
   var obj={"login":login(req)};
   res.render("user/login.ejs",obj);
});
router.get("/register",async function(req,res){
    var obj={"login":login(req)};
    res.render("user/register.ejs",obj);
 });
 router.post("/save_user",async function(req,res){
    // await exe(`create table user(user_id int primary key auto_increment,user_name varchar(200),user_mobile varchar(15),
    // user_email varchar(200),user_password varchar(200))`);
    var users=await exe(`insert into user(user_name,user_mobile,
    user_email,user_password) values 
    ('${req.body.user_name}','${req.body.user_mobile}','${req.body.user_email}','${req.body.user_password}')`);
    res.redirect("/login");
 });
 router.post("/do_login",async function(req,res){
    var data=await exe(`select * from user where user_mobile='${req.body.user_mobile}' and user_password='${req.body.user_password}'`);
    if(data.length > 0){
        req.session.user_id=data[0].user_id;
    //res.send("Login Process Start");
    res.redirect("/");
    }
    else
    res.send("Login Process Fail");   
 });
 router.get("/conform_seat/:id",async function(req,res){
    if(req.session.user_id!=undefined){
        var id=req.params.id;
    var course_det=await exe(`select * from course where course_id='${id}'`);
    var user_det=await exe(`select * from user where user_id='${req.session.user_id}'`);
    var obj={"course_det":course_det[0],"user_det":user_det[0],"login":login(req)};
    res.render("user/conform_seat.ejs",obj);  
    }
    else{
      res.send(`
        <script>
           alert('Login First');
           location.href="/login";
        </script>
      `)
    }
 });
 router.post("/pay_course_fee/:course_id",async function(req,res){
    if(req.session.user_id!=undefined)
    {
        var course_id=req.params.course_id;
        var course_det=await exe(`select * from course where course_id='${course_id}'`);
        var amt=course_det[0].course_price;
        var user_id=req.session.user_id;
        var today=getDate();
        var sql=await exe(`insert into user_courses(user_id,course_id,amount,purchase_date,transaction_id) values
        ('${user_id}','${course_id}','${amt}','${today}','${req.body.razorpay_payment_id}')`);
        //await exe(`create table user_courses(user_id int,course_id int ,amount int,transaction_id varchar(100))`);
   // res.send("User Id="+course_id+" <br> Course Id="+user_id);
   res.redirect("/my_courses");
    }
    else
    {
        res.send(`
        <script>
           alert('Login First');
           location.href="/login";
        </script>
      `)  ;
    }
 });
 router.get("/my_courses", async function(req,res){
   if(req.session.user_id!=undefined)
    {
      var user_id=req.session.user_id;
      var courses_list=await exe(`select * from user_courses,course where user_courses.course_id = course.course_id and
      user_id='${user_id}'`);
      var obj={"courses_list":courses_list,"login":login(req)}
      res.render("user/my_courses.ejs",obj);
    }
    else{
       res.send(`
       <script>
         alert('Login First');
         location.href="/login";
       </script>
       `)  ;
    }
 });
 router.get("/edit_profile",async function(req,res){
   var user_id=req.session.user_id;
   if(req.session.user_id!=undefined)
   {
     var user_id=req.session.user_id;
     var my_profile=await exe(`select * from user where user_id = '${user_id}'`);
     var obj={"user":my_profile,"login":login(req)}
     res.render("user/edit_profile.ejs",obj);
   }
   else{ 
      res.send(`
      <script>
        alert('Login First');
        location.href="/login";
      </script>
      `)  ;
   }

  
 });
 router.get("/contact",async function(req,res){

  res.render("user/contact.ejs",obj)
});
 router.get("/logout",async function(req,res){
   req.session.user_id=undefined;
   res.redirect("/")
 });
module.exports =router;