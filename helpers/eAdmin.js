module.exports = {
    eAdmin: function(req, res, next){

        if(req.isAuthenticated() && req.user.eAdmin == 1){ // Diz se o usuario for igual a 1, ele é administrador!
            return next()
        }

        req.flash("error_msg", "Você precisa ser admin!")
        res.redirect("/")

    }

}