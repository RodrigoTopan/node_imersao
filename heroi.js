class Heroi {
    // nome='';
    // idade=0;
    // dataNascimento=new Date(-1);
    // poder='';
    // classe= 0;
    // chamada: New Heroi(commander)
    // commander:dados do heroi, dados do sistema
    //{} -> desconstruimos o objeto do  commander, usando 
    //apenas as propriedades que precisamos
    constructor({ nome, classe, data, poder }) {
        this.nome = nome;
        this.poder = poder;
        this.dataNascimento = data;
        this.classe = classe;
    }
}
//Deixamos a classe publica
module.exports = Heroi;

