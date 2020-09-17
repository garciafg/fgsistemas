const express = require('express')
const router = express.Router()
const mongoose = require("mongoose") // Chama o mongoose
require("../models/Categoria") // Chama o model categoria
const Categoria = mongoose.model("categorias") //Chama a função mongoose.model("nome dado na linha que cria collection") que vai referenciar a variavel Categoria
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

//Rotas


    router.get('/categorias', eAdmin, (req,res) => {
        Categoria.find().sort({date:"desc"}).then((categorias) => {// Model Categoria chama função find() que lista todas categorias
            res.render("admin/categorias", {categorias:categorias.map(categorias => categorias.toJSON())})// O Objeto categorias recebe valor de then(categorias)
        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro ao cadastrar.")
            res.redirect("/admin")
        })
        
    })

    router.get('/categorias/add', eAdmin, (req,res) => { //Pega a url
        res.render('admin/addcategorias')// carrega o html na view
    })

    //**Cadastrar nova categoria**// 
    router.post("/categorias/nova", eAdmin, (req, res) => {

        //** Validar os campos **//
        var erros = []
        
        //Se campo (!req.body.nome for vazio) (|| ou) typeof (tipo for indefinido) ou for nulo (null)
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            // Da um puch na variavel erros (array) e coloca o objeto texto com a mensagem
            erros.push({texto: ("Nome inválido!")})
        }

        if(!req.body.slug || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({texto:("Ouve um erro!")})
        }

        if(req.body.nome.length < 2) {
            erros.push({texto: ("O nome precisa ser maior que 2 caracteres.")})
        }
        
        // Se ouver algum erro adiciona a mensagem no array
        if(erros.length > 0){ // tamanho variavel erros for maior que 0 faça:
            res.render("admin/addcategorias", {erros: erros})// Renderiza a view com a variavel erros
        }else{ //Se deu tudo certo, cadastra a categoria
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }  
    
            //Linha que vai criar a nova categoria
            new Categoria(novaCategoria).save().then(() => {
                //Depois de salvar a nova categoria, redireciona para a pagina categorias
                req.flash("success_msg", "Categoria salva com sucesso")// Joga a mensagem dentro da variavel global success_msg
                res.redirect("/admin/categorias")
            }).catch(() => {
                req.flash("error_msg", "Houve um erro ao salvar a categoria. Tente outra vez.")
                res.redirect("/admin")
            })
        }

        //* Fim Validar os campos *//


    })
    //* Fim cadastro categorias */

    router.get('/noticias', eAdmin, (req, res) => {
        res.send("Pagina de noticias dentro do admin!")
    })

    router.get('/categorias/edit/:id', eAdmin, (req, res) => {
        Categoria.findOne({_id: req.params.id}).then((categoria) => {
            res.render("admin/editcategoria", {categoria: categoria.toJSON()})
        }).catch((err) => {
            req.flash("error_msg", "Essa categoria não existe!")
            res.redirect("/admin/categorias")
        })
    })

    //Aplicando as edições
    router.post("/categorias/edit", eAdmin, (req, res) => {

        // Chama a categoria pelo id
        Categoria.findOne({_id: req.body.id}).then((categoria) => {

            //Os campos do form de edição recebe o valor aqui
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Ouve um erro ao editar a categoria")
                res.redirect("/admin/categorias")
            })

        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro ao editar a categoria!")
            res.redirect("/admin/categorias")
        })

    })
    // fim Aplicando as edições

    //Deletar a categoria
    router.post("/categorias/deletar", eAdmin, (req, res) => {
        Categoria.remove({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro ao deletar a categoria!")
            res.redirect("/admin/categorias")
        })
    })


    router.get("/postagens", eAdmin, (req, res) => { //carrega a lista de postagens

        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("admin/postagens", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro ao exibir as postagens!")
            res.redirect("/admin")
        })
        
    })


    router.get("/postagens/edit/:id", eAdmin, (req, res) => {

        Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
            Categoria.find().lean().then((categorias) => {
                res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
            }).catch((err) => {
                req.flash("error_msg", "Ouve um erroao listar as categorias")
                res.redirect("/admin/postagens")
            })

        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro aocarregar o formulario de edição")
            res.redirect("/admin/postagens")
        })
       
       
    })

    router.post("/postagens/edit", eAdmin, (req, res) => {
        Postagem.findOne({_id: req.body.id}).then((postagem) => {

            postagem.titulo = req.body.titulo,
            postagem.slug = req.body.slug,
            postagem.descricao = req.body.descricao,
            postagem.conteudo = req.body.conteudo,
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash("success_msg", "Postageme ditada com sucesso")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Ouve um erro interno!")
            })

        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro ao editar a postagem!")
            res.redirect("/admin/postagens")
        })
    })


    router.get("/postagens/add", eAdmin, (req, res) => { //Carrega a pagina pra adicionar postagens
        Categoria.find().lean().then((categoria) => { //Passa todas as categorias para a view addpostagem
            res.render("admin/addpostagem", {categoria: categoria})
        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro ao cadastrar a postagem!")
        })
        
    })

    router.post("/postagens/nova", eAdmin, (req, res) => {

        var erros = []
        
        if(req.body.categoria == "0") {
            erros.push({texto: "O valor da categoria é inválido!"})
        }

        if(erros.length > 0) {
            res.render("admin/postagens", {erros: erros})
        }else {
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }

            new Postagem(novaPostagem).save().then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Ouve um erro ao cadastrar a postagem!")
                res.redirect("/admin/postagens")
            })
        }

    })

    router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
        Postagem.remove({_id: req.params.id}).then(() => {
            req.flash("success_msg", "Postagem deletada com sucesso! ")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Ouve um erro ao deletar a postagem")
            res.redirect("/admin/postagens")
        })
    })



module.exports = router