//Carregando modulos
    const express = require('express')
    const handlebars = require("express-handlebars")
    const bodyParser = require('body-parser')
    const app = express()

    //Adiciona o prefixos das rotas
    const admin = require("./routes/admin")
    //Adiciona diretorios
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require("connect-flash")

    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")

    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")

    const usuarios = require("./routes/usuario")

    const moment = require('moment')

    const passport = require("passport")
    require("./config/auth")(passport)

    const db = require("./config/db")

//Configurações

    // Sessão
    app.use(session({
        secret: "chavequalquer",
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    //Midleaware
    app.use((req, res, next) => {
        //As variavei globais para exibir o erro ou sucesso
        res.locals.success_msg = req.flash("success_msg")//Variavel global de sucesso
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null; //Armazena o usuario em uma variavel global
        next()
    })

    //Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    //Handlebars
    app.engine('handlebars', handlebars({

        defaultLayout: 'main',

        helpers: {

            formatDate: (date) => {

                return moment(date).format('DD/MM/YYYY')

            }

        }

    }))
    app.set('view engine', 'handlebars');

    //Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI).then(() => { //Conexao com o banco de dados
        console.log("Conectado com sucesso! :)")
    }).catch((err) => {
        console.log("Erro ao conectar :(" +err)
    })
    
    //Public (Pegar o caminho absoluto da pasta public)
    app.use(express.static(path.join(__dirname, "public")))

    //Midleware, para gerenciar as requesições
    app.use((req, res, next) => {
        console.log("OI, eu sou um middler")
        next()
    })


//Rotas
    app.get('/', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro interno!")
            res.redirect("/404")
        })
        
    })

    app.get("/404", (req, res) => {
        res.send("<h2>Página não encontrada</h2>")
    })

    app.get("/postagem/:slug", (req, res) => {

        Postagem.findOne({slug:req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                res.flash("error_msg", "Ouve um erro ao abrir a postagem!")
                res.redirect("/")
            }
        }).catch((err)  => {
            req.flash("error_msg", "Ouve um erro interno!")
            res.redirect("/")
        })

    })

    // Exemplo de Rota diretas////////////
    app.get("/noticias", (req, res) => {
        res.send("<h1>Pagina de noticias</h1>")
    })
    //Fim Rota direta//////////

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno!")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {

            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {

                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})

                }).catch((err) => {
                    req.flash("error_msg", "Ouve um erro ao listar os posts!")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Categoria não encontrada!")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro interno!")
            res.redirect("/")
        }) 
    })
//Importando as rotas
    app.use('/admin', admin)
    app.use('/usuarios', usuarios)

//outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando na porta 8081.")
})