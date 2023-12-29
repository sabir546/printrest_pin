var express = require('express');
var router = express.Router();
const  User=require('./users')
const passport=require('passport')
const localStrategy =require('passport-local')
passport.use(new localStrategy(User.authenticate()));
const postModel=require('./post')
const upload = require('./multer');



router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});


router.get('/register', function(req, res, next) {
  res.render('register',{nav:false});
});

router.post('/register', async function(req, res, next) {
  try { await User.register(
    {
      username: req.body.username, email: req.body.email
    },
    req.body.password
  );
  res.redirect('/')
    
  }
   catch (error) {
    console.log('error')
    res.send(error)
  }
});


router.get('/signin', function(req, res, next) {
  res.render('signin',{nav:false});
});


router.get('/profile',isLoggedIn,async function(req, res, next) {
  const user=await User.findOne({username:req.session.passport.user})
  res.render('profile', {user, nav:true})
});


router.get('/add',isLoggedIn,async function(req, res, next) {
  const user=await User.findOne({username:req.session.passport.user})
  res.render('add', {user, nav:true})
});

router.post('/createpost',isLoggedIn, upload.single("postimage"), async function(req, res, next) {
  const user=await User.findOne({username:req.session.passport.user})
  const post =await postModel.create({
    user:User_id,
  title:req.body.title,
  description:req.body.description,
  image:req.body.filename
  })

  user.posts.push(post._id);
await user.save();
res.redirect("/profile")
});


router.post('/signin', 
  passport.authenticate('local',{
    successRedirect:'/profile',
    failureRedirect: '/',
  }),
  function(req ,res ,next ){}
);
function isLoggedIn(req, res,next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    res.redirect('/')
  }
}

router.get("/signout",isLoggedIn,function(req, res, next){
  req.logout(()=>{
    res.redirect('/');
  })
})


router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
 const user=await User.findOne({username:req.session.passport.user})
 user.profileImage=req.file.filename;
 await user.save();
 res.redirect('/profile');
});

module.exports = router;
