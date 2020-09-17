const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")


router.get('/registro', (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {

    var erros = []
    //Validação do formulario de cadastro de usuario
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido!"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida!"})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas não conferem. Tente novamente!"})
    }

    //Aqui ele confere se existi algum erro, se tiver exibi a mensagem
    if(erros.length > 0){

        res.render("usuarios/registro", {erros: erros})//Renderiza a view passando os erros

    }else{
        //Pesquisa no banco de dados se ja existe um usuario com o email cadastrado ja
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            //Se retornar alguma coisa
            if(usuario){
                req.flash("error_msg", "ja existe um usuário com esse email cadastrado!")
                res.redirect("/usuarios/registro")
            }else{
                //Aqui o sistema cria o novo usuario
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                //Gerar o hash da senha
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Ouve um erro no salvamento da senha")
                            res.redirect("/")
                        }

                        //Agora sim, salva a senha com o hash
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Sucesso! usuario cadastrado em nosso sistema.")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Ouve um erro ao registrar o novo usuario")
                            res.redirect("/usuarios/registro")
                        })

                    })
                })

            }
        }).catch((err) => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/")
        })
    }

    
})
//Fim de validação e cadastro de usuario




//Login
router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {

    //faz o redirecionamento apos a autenticação
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})

router.get("/logout", (req, res)=> {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")
})



module.exports = router