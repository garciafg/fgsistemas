const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Model de usuario
require("../models/Usuario")

const Usuario = mongoose.model("usuarios")


module.exports = function(passport){
    // Aqui ele diz qual campo q vai ser analisado na autenticação
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'},(email, senha, done) => {

        Usuario.findOne({email: email}).then((usuario) => {
            //Se nao existir o usuario
            if(!usuario){
                return done(null, false, {message: "Essa conta não existe!"})
            }

            // Se o usuario existir, vai comparar as senhas
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {

                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: "Senha incorreta!"})
                }

            })

        })

    }))


    // Passar os dados do uruario pra sessao
    passport.serializeUser((usuario, done) => {

        done(null, usuario.id)

    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })

}