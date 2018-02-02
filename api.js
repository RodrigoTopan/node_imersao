
const { config } = require('dotenv');
if (process.env.NODE_ENV === 'production') config({ path: 'config/.env.prod' });
else config({ path: 'config/.env.dev' });



const Hapi = require('hapi');
const Database = require('./databaseSQL');
const Joi = require('joi');

const Vision = require('vision');
const Inert = require('inert');
const HapiSwagger = require('hapi-swagger');

const databaseSQL = new Database();

const USUARIO_VALIDO = {
    username: 'Rodrigo',
    password: '123',
};
const SECRET_KEY = process.env.SECRET_KEY;
const ID_TOKEN = process.env.ID_TOKEN;
const HapiJwt = require('hapi-auth-jwt2');
const Jwt = require('jsonwebtoken');

//inicializamos o nosso servidor WEB
const app = new Hapi.Server();
//definimos a porta
app.connection({ port: process.env.PORT });

async function registrarRotas() {
    try {
        await databaseSQL.conectar();
        app.route([
            {
                //definir o caminho da url localhost:3000/heroes
                path: '/login',
                //definir o method http
                method: 'POST',
                //Para desabilitar o jwt
                config: {
                    auth: false,
                    description: 'Rota para gerar token, a partir de login e senha',
                    notes: 'Token para acessar outras apis',
                    tags: ['api'],
                    validate: {
                        payload: {
                            username: Joi.string().required(),
                            password: Joi.string().required(),
                        }
                    },
                    handler: (req, reply) => {
                        try {
                            const loginSenha = req.payload;
                            //Aqui seria o momento de valiar
                            //database.login() caso fosse um usuario valido
                            //ai sim, voce gera o token e deixa ele passar
                            if (
                                !(loginSenha.username === USUARIO_VALIDO.username &&
                                    loginSenha.password === USUARIO_VALIDO.password)
                            )

                                return reply('Usuario ou senha, inválidos');

                            const { username } = loginSenha;

                            const token = Jwt.sign({ username, idToken: ID_TOKEN }, SECRET_KEY);

                            return reply({ token });
                        } catch (e) {
                            console.log('deu ruim', e);
                            return reply('DEU RUIM');
                        }
                    }
                },
            },
            {
                //definir o caminho da url localhost:3000/heroes
                path: '/employees',
                //definir o method http
                method: 'GET',
                config: {
                    auth: 'jwt',
                    description: 'Retorna todos os funcionários do sistema',
                    notes: 'Retorna todos os funcionários cadastrados',
                    tags: ['api'],
                    validate: {
                        headers: Joi.object({
                            authorization: Joi.string().required(),
                        }).unknown(),
                    },
                    handler: async (req, reply) => {
                        try {
                            const result = await databaseSQL.listarFuncionarios();
                            return reply(result);
                        } catch (e) {
                            console.log('deu ruim', e);
                            return reply('DEU RUIM');
                        }
                    }
                }
            },
            {
                path: '/employees',
                method: 'POST',
                config: {
                    description: 'Rota para cadastrar novos funcionários',
                    notes: 'Realiza o cadastro completo de um novo funcionário',
                    tags: ['api'],
                    auth: 'jwt',
                    validate: {
                        payload: {
                            nome: Joi.string()
                                .max(20)
                                .min(2)
                                .required(),
                            idade: Joi.string().required(),
                            dataNascimento: Joi.date().required(),
                            UserID: Joi.string().required(),
                        },
                        headers: Joi.object({
                            authorization: Joi.string().required(),
                        }).unknown(),
                    },
                    handler: async (req, reply) => {
                        try {
                            //PARA RECEBER OS DADOS VIA CORPO DA REQUISIÇÃO 
                            // USAMOS O OBJETO PAYLOAD DA REQUISIÇÃO 
                            const dados = req.payload;
                            const result = await databaseSQL.cadastrarFuncionarios(dados);
                            return reply(result);
                        } catch (e) {
                            console.log('deu ruim', e);
                            return reply('DEU RUIM');
                        }
                    }
                }
            },
            {
                path: '/employees/{id}',
                method: 'GET',
                config: {
                    auth: 'jwt',
                    description: 'Rota para pesquisar um funcionário específico por id',
                    notes: 'Pesquisar um funcionário por id',
                    tags: ['api'],
                    validate: {
                        params: {
                            id: Joi.string().required(),
                        },
                        headers: Joi.object({
                            authorization: Joi.string().required(),
                        }).unknown(),
                    },
                    handler: async (req, reply) => {
                        try {
                            const id = req.params.id;
                            const result = await databaseSQL.pesquisarFuncionario(id);
                            return reply(result);
                        } catch (e) {
                            console.log('deu ruim', e);
                            return reply('DEU RUIM');
                        }
                    }
                },
            },
            //------------------------------- EMPRESAS-----------------------------------------------
            {
                //definir o caminho da url localhost:3000/heroes
                path: '/companies',
                //definir o method http
                method: 'GET',
                config: {
                    auth: 'jwt',
                    description: 'Retorna todas as empresas do sistema',
                    notes: 'Retorna todos as empresas cadastradas',
                    tags: ['api'],
                    validate: {
                        headers: Joi.object({
                            authorization: Joi.string().required(),
                        }).unknown(),
                    },
                    handler: async (req, reply) => {
                        try {
                            const result = await databaseSQL.listarEmpresas();
                            return reply(result);
                        } catch (e) {
                            console.log('deu ruim', e);
                            return reply('DEU RUIM');
                        }
                    }
                }
            },
            {
                path: '/users',
                method: 'POST',
                config: {
                    auth: false,
                    description: 'Rota para cadastrar novos Usuários',
                    notes: 'Realiza o cadastro completo de um novo usuário',
                    tags: ['api'],
                    validate: {
                        payload: {
                            username: Joi.string()
                                .max(20)
                                .min(2)
                                .required(),
                            password: Joi.string().required(),
                        },
                    },
                    handler: async (req, reply) => {
                        try {
                            const dados = req.payload;
                            const result = await databaseSQL.cadastrarUsuarios(dados);
                            return reply(result);
                        } catch (e) {
                            console.log('deu ruim', e);
                            return reply('DEU RUIM');
                        }
                    }
                }
            },
        ]);
    } catch (e) {
        console.error('DEU RUIM', e);
    }
}

app.register([
    //registramos o plugin de auth
    HapiJwt,
    //Registramos os plugins para trabalhar com o SWAGGER
    Inert,
    Vision,
    {
        register: HapiSwagger,
        options: { info: { title: 'RPM - Resources Planning Management', version: '1.0' } }
    }])
    .then(_ => {
        // configuramos a estratégia de autenticação
        //passamos um nome que será usado em cada rota
        //e no objeto validate, validamos se o token é valido
        app.auth.strategy('jwt', 'jwt', {
            secret: SECRET_KEY,
            verifyFunc: (decoded, request, callback) => {
                if (decoded.idToken !== ID_TOKEN) return callback(null, false);
                //ESSE MÉTODO É INVOCADO CADA VEZ QUE USAR O TOKEN
                // E NO OBJETO VALIDATE, VALIDAMOS SE O TOKEN É VALIDO
                return callback(null, true);
            },
            //ALGORITMO DE AUTENTICAÇÃO HASH
            verifyOptions: { algorithms: ['HS256'] }
        });
        //setamos o jwt como default obrigatório
        app.auth.default('jwt');
    }).then(registrarRotas).then(_ => {
        app.start(() => console.log(`Servidor rodando na porta ${process.env.PORT}`));
    });

//para definir o endereço que o cliente vai trabalhar com a sua api 
//definimos as rotas
