module.exports.isLoggedIn = (req,res,next) => {
     if(! req.isAuthenticated()){
       //redirectUrl 
       req.session.redirectUrl = req.originalUrl;
       req.flash("error","you must be Admin to logged in for creating new employee ! ");
       return  res.redirect("/login");
   }
   next();
}

module.exports.saveRedirectUrl = (req,res,next) =>{
  if( req.session.redirectUrl ){
    res.locals.redirectUrl = req.session.redirectUrl ;
  }

  next();
}