var express = require("express");
var router = express.Router();
var exe = require("./connection");
router.get("/", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
        var year = new Date().getFullYear();
        var jan_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-01-%'`);
        var feb_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-02-%'`);
        var mar_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-03-%'`);
        var apr_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-04-%'`);
        var may_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-05-%'`);
        var june_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-06-%'`);
        var jule_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-07-%'`);
        var aug_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-08-%'`);
        var sep_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-09-%'`);
        var oct_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-10-%'`);
        var nov_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-11-%'`);
        var dec_data = await exe(`select COUNT(user_courses_id) as ttl from user_courses where purchase_date like '${year}-12-%'`);

        var obj = {
            'jan': jan_data[0].ttl, 'feb': feb_data[0].ttl, 'mar': mar_data[0].ttl, 'apr': apr_data[0].ttl, 'may': may_data[0].ttl, 'june': june_data[0].ttl,
            'jule': jule_data[0].ttl, 'aug': aug_data[0].ttl, 'sep': sep_data[0].ttl, 'oct': oct_data[0].ttl, 'nov': nov_data[0].ttl, 'dec': dec_data[0].ttl,
        };
        res.render("admin/home.ejs", obj);
    }
});
router.get("/manage_slider", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
    var data = await exe(`select * from slider`);
    var obj = { "slides": data };
    res.render("admin/manage_slider.ejs", obj);
    }
});
router.post("/save_slider", async function (req, res) {

    const today = new Date();
    var time = today.getTime();
    var filename = time + req.files.slider_img.name;
    req.files.slider_img.mv("public/uploads/" + filename);
    // await exe(`create table slider(slider_id int primary key auto_increment,slider_img text,slider_title text,
    //     slider_btn_text varchar(200),slider_btn_link text)`);
    await exe(`insert into slider(slider_img ,slider_title,slider_btn_text ,slider_btn_link) values
    ('${filename}','${req.body.slider_title}','${req.body.slider_btn_text}','${req.body.slider_btn_link}')`);
    res.redirect("/admin/manage_slider");
});
router.get("/edit_slide/:slider_id", async function (req, res) {

    var id = req.params.slider_id;
    var data = await exe(`SELECT * FROM slider where slider_id='${id}'`);
    var obj = { "slides": data[0] };
    res.render("admin/edit_slider.ejs", obj);
});
router.post("/update_slider/:slider_id", async function (req, res) {
    var id = req.params.slider_id;
    var d = req.body;
    const today = new Date();
    var time = today.getTime();
    var filename = time + req.files.slider_img.name;
    req.files.slider_img.mv('public/uploads/'+filename);
    await exe(`UPDATE slider SET slider_img ='${filename}' WHERE slider_id='${id}'`);

    await exe(`UPDATE slider SET slider_title='${d.slider_title}',slider_btn_text='${d.slider_btn_text}',slider_btn_link='${d.slider_btn_link}' WHERE 
    slider_id='${id}'`);
    console.log(req.files);
    console.log(req.body);

    res.redirect("/admin/manage_slider");

});
router.get("/delete_slide/:slider_id", async function (req, res) {

      var id = req.params.slider_id;
      await exe(`DELETE FROM slider where slider_id='${id}'`);
      res.redirect("/admin/manage_slider");
});
router.get("/manage_category", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
    var data = await exe(`select * from category`);
    var obj = { "cats": data };
    res.render("admin/manage_category.ejs", obj);
    }
});
router.post("/save_category", async function (req, res) {
    var details = req.body.category_details.replace("'", "\\'");
    await exe(`insert into category(category_name,category_details) values
     ('${req.body.category_name}','${details}')`);
    res.redirect("/admin/manage_category");
});
router.get("/add_course", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
    var data = await exe(`select * from category`);
    var obj = { "cat_list": data };
    res.render("admin/add_course.ejs", obj);
    }
});
router.post("/save_course", async function (req, res) {
    const today = new Date();
    var time = today.getTime();
    console.log(req.body);
    console.log(req.files);
    var img_name = time + req.files.course_img.name;
    req.files.course_img.mv("public/uploads/" + img_name);
    var video_name = "";
    if (req.files.course_sample_video != undefined) {
        var video_name = time + req.files.course_sample_video.name;
        req.files.course_sample_video.mv("public/uploads/" + video_name);
    }
    // await exe(`create table course(course_id int primary key auto_increment,course_name text,course_category_id int,
    //     course_duration varchar(200),course_price varchar(20),course_img text,course_sample_video text,
    //     course_mentor varchar(200),course_link text,course_platform varchar(100),course_details text)`);
    var d = req.body;
    var course_name = d.course_name.replace("'", "\\'");
    var course_details = d.course_details.replace("'", "\\'");

    var data = await exe(`insert into course(course_name,course_category_id , 
        course_duration ,course_price ,course_img ,course_sample_video ,
        course_mentor,course_link,course_platform ,course_details ) values
        ('${course_name}','${d.course_category_id}','${d.course_duration}','${d.course_price}','${img_name}',
        '${video_name}','${d.course_mentor}','${d.course_link}','${d.course_platform}','${course_details}')`);
          
        res.send(`
        <script>
        alert('Course Successfully Added ');
        location.href="/admin/add_course";
      </script>
        `)  ;
        
   
});
router.get("/course_list", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
    var data = await exe(`select * from course,category where course.course_category_id=category.category_id`);
    var obj = { "course": data };
    res.render("admin/course_list.ejs", obj);
    }
});
router.get("/course_details/:course_id", async function (req, res) {
    var id = req.params.course_id;
    var data = await exe(`select * from course,category where course.course_category_id=category.category_id and course_id='${id}'`);
    var obj = { "course": data[0] };
    res.render("admin/course_details.ejs", obj);
});
router.get("/delete_cats/:category_id", async function (req, res) {

    var id = req.params.category_id;
    await exe(`DELETE FROM category where category_id='${id}'`);
    res.redirect("/admin/manage_category");
});
router.get("/edit_cats/:category_id", async function(req,res){
    var id=req.params.category_id;
    var data=await exe(`SELECT * FROM category WHERE category_id='${id}'`);
    var obj = { "cats": data[0] };
    res.render("admin/edit_cats.ejs",obj);
});
router.post("/update_category/:category_id",async function(req,res){
    var category_id=req.params.category_id;
 
    await exe(`UPDATE category SET category_name='${req.body.category_name}',category_details='${req.body.category_details}' WHERE category_id='${category_id}'`);
    res.redirect("/admin/manage_category");
});
router.get("/all_user_list", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
    var data = await exe(`select * from user `);
    var obj = { "user": data };
    res.render("admin/all_user_list.ejs",obj);
    }
});
router.get("/delete_course/:course_id", async function (req, res) {

    var id = req.params.course_id;
    await exe(`DELETE FROM course where course_id='${id}'`);
    res.redirect("/admin/course_list");
});
router.get("/sold_courses", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
    var data = await exe(`select * from user_courses,course,user where user_courses.user_id = user.user_id and
    user_courses.course_id=course.course_id`);
    var obj = { "course": data };
    console.log(data);
    res.render("admin/sold_courses.ejs", obj);
    }
});
router.get("/login", async function (req, res) {
    res.render("admin/login.ejs");
});
router.post("/admin_login_process", async function (req, res) {
    var sql = `select * from admin where admin_email='${req.body.admin_email}' and admin_password='${req.body.admin_password}'`;
    var data = await exe(sql);
    if (data.length > 0) {
        req.session.admin_id = data[0].admin_id;
        res.redirect("/admin");
    }
    else{
        res.send(`
        <script>
          alert('Admin Login Fail ');
          location.href="/admin/login";
        </script>
        `)  ;
     }
    // res.send(data);
    // res.send(req.body);
});
router.get("/logout",async function(req,res){
    req.session.admin_id=undefined;
    res.redirect("/admin")
  });
 router.get("/profile", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
    var data = await exe(`select * from admin `);
    var obj = { "admin": data };
    res.render("admin/profile.ejs",obj);
    }
});

module.exports = router;