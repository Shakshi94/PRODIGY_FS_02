module.exports.isLoggedIn = (req,res,next) => {
     if(! req.isAuthenticated()){
       //redirectUrl 
       req.session.redirectUrl = req.originalUrl;
       req.flash("error","Admin must be logged In ");
       return  res.redirect("/login");
   }
   next();
}

module.exports.saveRedirectUrl = (req,res,next) =>{
 if (!req.session.returnTo && req.headers.referer) {
        req.session.returnTo = req.headers.referer;
    }
    next();
}

module.exports.checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
}