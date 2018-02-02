class Funcionario {
    constructor({ nome, idade, data, usuario_id }) {
        this.nome = nome;
        this.idade = idade;
        this.dataNascimento = data;
        this.usuarioId = usuario_id;
    }
}
//Deixamos a classe publica
module.exports = Funcionario;

