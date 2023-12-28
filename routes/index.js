var express = require('express');
var router = express.Router();
const  User=require('./users')
const passport=require('passport')
const localStrategy =require('passport-local')
passport.use(new localStrategy(User.authenticate()));

const upload = require('./multer');



router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/register', function(req, res, next) {
  res.render('register');
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
  res.render('signin');
});


router.get('/profile',isLoggedIn,async function(req, res, next) {
  const user=await User.findOne({username:req.session.passport.user})
  res.render('profile', {user})
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
