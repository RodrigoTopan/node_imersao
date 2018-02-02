#!/usr/bin/env node
//Executável

//Nossas funções para manipular chamadas via terminal
//via terminal
//>node cli.js --nome Rodrigo
// ./cli.js --nome Rodrigo

const Commander = require('commander');
const Heroi = require('./heroi');

//importamos a database
const Database = require('./database');
const database = new Database();

//Importamos a classe de manipulação
//de informação de sql
const DatabaseSQL = require('./databaseSQL');
const databaseSQL = new DatabaseSQL();
//await database.cadastrar(hero);
//const resultado = await database.listar();
//console.log('resultado',resultado);

// const Heroi = {
//     nome: '',
//     poder: '',
//     dataNascimento: null,
//     classe: classe.warrior
// };


Commander
    // informamos a versão da nossa ferrmamenta
    .version('v1.0.1')
    //informamos uma opção, e que essa opção receberá um valor
    .option('-n, --nome [value]', 'Recebe o nome do herói')
    .option('-p, --poder [value]', 'Recebe o poder do herói')
    .option('-d, --data [value]', 'Recebe a data de nascimento do herói')
    .option('-c, --classe [value]', 'Recebe a classe do herói')
    .option('-r, --remover', 'Remove um heroi pelo nome')
    .option('-l, --listar', 'Lista todos os heróis')
    .option('-a, --adicionar', 'Adiciona um heroi pelo nome')
    .option('-u, --atualizar [value]', 'Atualiza um heroi pelo nome')
    .option('--relatorioclasse', 'Quantidade de heróis da mesma classe')
    //informamos que os parametros virão relatoriopoder
    //dos argumentos de quem chamar essa função
    .parse(process.argv);

/*
node cli.js \
-n 'Rodrigo' \
-p "Programador" \
--data '1997-03-11' \
-c 'mago' -a 
*/
/*
node cli.js \
-n 'Daniel' \
-p "Programador" \
--data '1996-03-11' \
-c 'warrior' -a 
*/
/*
node cli.js \
-n 'Erick' \
-p "Programador" \
--data '1995-03-11' \
-c 'rogue' -a 
*/
async function execucao(commander) {
    try {
        //console.log("COMMANDER",commander);
        const hero = new Heroi(commander);
        //inicializamos a conexão com a base de dados
        //se a base de dados estiver indisponivel 
        //cai no catch e não quebra a aplicação
        await databaseSQL.conectar();
        //hero.nome = commander.nome,
        //hero.poder = commander.poder,
        //hero.dataNascimento = commander.data,
        //hero.classe = classe[commander.caracteristica]; 
        // nome:commander.nome,  
        // poder:commander.poder,
        // //usamos um padrão chamado HASHMAP
        // //definimos um dicionário de dados
        // //informamos que a script 'warrior' quando chegar ao objetivo se torna 1
        // dataNascimento: commander.data,
        // classe:classe[commander.classe] 
        // console.log('meu heroi', hero);
        //var = qualquer coisa
        // let = 
        // const = não altera 
        if (commander.remover) {
            // await database.remover(hero.nome);
            await databaseSQL.remover(hero.nome);
            return;
        }
        if (commander.adicionar) {
            //adicionamos a classe para manipulação a partir do banco de dados
            await databaseSQL.cadastrar(hero);
            //await database.cadastrar(hero);
            process.exit(0);
            return;
        }
        if (commander.listar) {
            const result = await databaseSQL.listarHerois();
            //const result = await database.listar();
            console.log(result);
            process.exit(0);
            return;
        }
        if (commander.atualizar) {
            const nomeAntigo = commander.atualizar;
            //await database.atualizar(nomeAntigo, hero);
            await databaseSQL.atualizar(nomeAntigo, hero);
            const listar = await databaseSQL.listarHerois();
            console.log(listar);
            process.exit(0);
            return;
        }
        if (commander.relatorioclasse) {

            const result = await database.relatorioclasse();
            console.log("RELATÓRIO CLASSE", result);
            process.exit(0);
            return;
        }

    }
    catch (e) {
        console.error(e);
        process.exit(0);
    }
}

execucao(Commander);
