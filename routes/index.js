var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

var options = {
  server: {
    socketOptions: {
      connectTimeoutMS: 5000
    }
  }
};
mongoose.connect('mongodb://admin:Fhti5ekop@ds215093.mlab.com:15093/authentification', options, function(err) {
  console.log("erreur : ",err);
});

var userSchema = mongoose.Schema({
  lastName: String,
  firstName: String,
  email: String,
  password: String,
  phone: String,
  Address: String,
  zipcode: Number
});
var UserModel = mongoose.model('users', userSchema);
var orderSchema = mongoose.Schema({
  total: String,
  fdp: String,
  ID_user: String
});
var OrderModel = mongoose.model('orders', orderSchema);

/* Route vers la page index qui permet de se logger */
router.get('/', function(req, res, next) {

    res.render('index',{message:"Connectez-vous svp"});
});

//Route vers la page inscription subscribe.ejs
router.get('/subscribe', function(req, res, next) {

    res.render('subscribe');
});


router.post('/login', function(req, res, next) {

var hash = bcrypt.hashSync(req.body.password, salt);

  UserModel.find(
    {email:req.body.email,password:hash},
   function(err, users) {
     // si la requete a trouvé quelquechose
     if(users.length>=1){
       // on passe l'id en variable de session
       req.session._id = users[0]._id;
       // On passe les données de l'utilisateur en variable de session
       req.session.dataUser = users;
       // On renvoi vers account en donnant le tableau users
        res.render('account', {users});
     }else{
       // si la requete n'a rien trouvé => l'utilisateur n'existe pas on passe le message d'erreur et on renvoie vers index
       //res.redirect('/');
       var message ="Erreur d'identification  !";
         res.render('index', {message});
     }
  })
});

router.get('/order', function(req, res, next) {

  UserModel.find({
    _id : req.session._id
  },function(err, allUsers){
    req.session.dataUser = allUsers
    OrderModel.find({ID_user: req.session._id},
     function(err, orders) {
      res.render('order', {orders, users:req.session.dataUser});
    })
  })
});
////// ajout route
router.post('/add-user', function(req, res, next) {

var hash = bcrypt.hashSync(req.body.password, salt);

  var newUser = new UserModel({
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    email: req.body.email,
    password: hash,
    phone: req.body.phone,
    Address: req.body.Address,
    zipcode: req.body.zipcode
  });

  UserModel.find({
      email:req.body.email
   },function(err, allUsers) {

     if (allUsers.length >= 1) {
       req.session._id = allUsers[0]._id
        req.session.dataUser = allUsers[0]
        res.render('account', {users: allUsers});
     }
     else{
       newUser.save(
         function(error, oneUser) {
         UserModel.find({_id: oneUser._id},
          function(err, usersWithThisId) {
            console.log("usersWithThisId",usersWithThisId);
           res.render('account', {users: usersWithThisId});
         })
       })
     }
  })



});


////
router.post('/add-user', function(req, res, next) {

var hash = bcrypt.hashSync(req.body.password, salt);

  var newUser = new UserModel({
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    email: req.body.email,
    password: hash,
    phone: req.body.phone,
    Address: req.body.Address,
    zipcode: req.body.zipcode
  });

  UserModel.find({
      email:req.body.email
   },function(err, allUsers) {

     if (allUsers.length >= 1) {
       req.session._id = allUsers[0]._id
        req.session.dataUser = allUsers[0]
        res.render('account', {users: allUsers});
     }
     else{
       newUser.save(
         function(error, oneUser) {
         UserModel.find({_id: oneUser._id},
          function(err, usersWithThisId) {
            console.log("usersWithThisId",usersWithThisId);
           res.render('account', {users: usersWithThisId});
         })
       })
     }
  })



});

router.post('/update-user', function(req, res, next) {

  UserModel.update({
    _id: req.session._id
  }, {
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    email: req.body.email,
    phone: req.body.phone,
    Address: req.body.Address,
    zipcode: req.body.zipcode
  },
  function(error, raw) {
    UserModel.find({_id: req.session._id},
     function(err, users) {
      res.render('account', {users});
    })
  });
});

router.get('/add-order', function(req, res, next) {

  var newOrder = new OrderModel({
    total: req.query.total,
    fdp: req.query.fdp,
    ID_user: req.session._id
  });
  newOrder.save(function(error, order) {
    OrderModel.find(
      {ID_user: req.session._id},
     function(err, orders) {
      res.render('order', {orders , users:req.session.dataUser});
    })
  });
});

module.exports = router;
