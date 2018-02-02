// 1 - rodamos o npm init em nossa pasta
//Para inicializar um processo node.js
//Criamos um arquivo chamado index.js 
//para inicializar todos os projetos

//importamos um pacote para trabalhar com arquivos
const Fs = require('fs');

//Instalamos o BLUEBIRD
const Bluebird = require('bluebird');
//trabalhando com callbacks, nossso código ficará gigante
//causando backhell
// usamos o PROMISIFYALL do bluebird para converter
//todas as funções assincronas do FS wur usam o padrão 
//callback para PROMISES
// -> PADRÃO CALLBACK
// Função que recebe como parametro, uma função com dois parametros
const FsAsync = Bluebird.promisifyAll(Fs)
const BANCO_DE_DADOS = 'Pessoas.json'

const result = FsAsync.writeFileAsync(BANCO_DE_DADOS, '[{nome:"Rodrigo"}]')
//Para sabe que nosso arquivo foi criado, usamos as funções
// ->then() para manipular o sucesso
// -> catch() para manipular o erro

//Usuamos a sintaxe error function
//que é um apelido para função (mesma funcao com )

//1-Forma de resolver promises
result
    .then(result => console.log(result))
    .catch((error) => console.log(error));

//2-Forma de resolver promises
//Criamos uma função para remover o arquivo
//Adicionamos a palavra async para declarar como assincrona
async function remover(nome) {
    //await aguarda o resultado 
    //a partir daquela linha
    const result = await FsAsync.unlinkAsync(nome);
    return result;
}

const resultRemover = remover(BANCO_DE_DADOS)
resultRemover
    .then(result => console.log('unlink', result))
    .catch(error => console.error('DEU RUIM', error))




/// ---------------------------------------------------------------- callback


// Fs.writeFile(BANCO_DE_DADOS,'[{nome: "Rodrigo Garcia"}]', 
// //Chamamos uma função que será invocada quando o sistema terminar de 
// //escrever o arquivo
// function(error,resposta){
//     if(error)
//     {
//         console.error('DEU RUIM',error)
//         return;
//     }    
//     console.log('resposta', resposta);
//     }
// );
// //Removemos o arquivo
// Fs.unlink(BANCO_DE_DADOS, function(error,resposta){
//     //não precisamos de um else pois caso o error exista ele para a execução
//     //a partir dali, nada mais desta função para baixo 
//     //executará
//     if(error){
//         console.error('DEU RUIM',error)
//         return;
//     }
//     console.log('resposta',resposta);
// });