const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId, //Aqui armazena o id da categoria que ela pertence
        ref: "categorias", // Referencia o nome dado ao model, no caso foi "categorias" = mongoose.model("categorias", Categoria)
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }

})

mongoose.model("postagens", Postagem)