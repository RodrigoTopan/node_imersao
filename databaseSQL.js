#!/usr/bin/env node
const Sequelize = require('sequelize');
//Bcrypt - para segurança :D
const bcrypt = require('bcrypt');
//const senha = 'abc123';

const Funcionario = require('./funcionario');
const Usuario = require('./usuario');
const Empresa = require('./empresa');
//const FuncionarioEmpresa = require('./funcionarioEmpresa');
class DatabaseSQL {
    constructor() {
        this.ImersaoNudesJS = {};
        this.EmployeeModel = {};
        this.CompanyModel = {};
        this.UserModel = {};
    }
    async conectar() {
        const herokuPostgres = process.env.DATABASE_URL;
        this.ImersaoNudesJS = new Sequelize(
            herokuPostgres,
            {
                dialect: 'postgres',
                dialectOptions: {
                    ssl: true,
                    requestTimeout: 30000, // timeout = 30 seconds
                },
            },
        );
        await this.definirModelo();
    }
    async definirModelo() {
        this.UserModel = this.ImersaoNudesJS.define('Users', {
            ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            USERNAME: Sequelize.STRING,
            PASSWORD: Sequelize.STRING,
        });
        this.EmployeeModel = this.ImersaoNudesJS.define('Employees', {
            ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            NOME: Sequelize.STRING,
            IDADE: Sequelize.STRING,
            DATA_NASCIMENTO: Sequelize.DATE,
            USER_ID: Sequelize.INTEGER,
            /*USUARIO_ID: {
                type: Sequelize.INTEGER,
                references: 'Users',
                referencesKey: 'ID',
                allowNull: false
            },*/
        });
        this.CompanyModel = this.ImersaoNudesJS.define('Companies', {
            ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            NOME: Sequelize.STRING,
            CNPJ: Sequelize.STRING,
        });

        /*this.EmployeeCompanyModel = this.ImersaoNudesJS.define('EmployeesCompanies', {
            /*ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            FUNCIONARIO_ID: Sequelize.INTEGER,
            EMPRESA_ID: Sequelize.INTEGER,
        });*/


        //Relacionamento 1 pra 1
        this.EmployeeModel.belongsTo(this.UserModel, { foreignKey: 'fk_userId', targetKey: 'ID', unique: true, });
        //this.EmployeeModel.belongsTo(this.UserModel, { foreignKey: 'fk_userId', targetKey: 'ID' });
        //{foreignKey: 'fk_companyname', targetKey: 'name'}
        //Relacionamento Muitos pra Muitos
        //this.EmployeeModel.hasMany(this.EmployeeCompanyModel);
        //this.CompanyModel.hasMany(this.EmployeeCompanyModel);
        //Belongs to many criará uma nova table chamada EmployeeCompanyModel
        this.EmployeeModel.belongsToMany(this.CompanyModel, { through: 'EmployeeCompanyModel', foreignKey: 'fk_employeeId', targetKey: 'ID' });
        this.CompanyModel.belongsToMany(this.EmployeeModel, { through: 'EmployeeCompanyModel', foreignKey: 'fk_companyId', targetKey: 'ID' });

        //this.EmployeeModel.hasMany(CompanyModel, { through: 'EmployeeCompanyModel' });
        //this.CompanyModel.hasMany(EmployeeModel, { through: 'EmployeeCompanyModel' });


        await this.UserModel.sync({ force: true })
        await this.EmployeeModel.sync({ force: true })
        await this.CompanyModel.sync({ force: true })

        await this.CompanyModel.create({
            NOME: 'GRUPO RESOLV',
            CNPJ: '11122233344'
        });
        await this.CompanyModel.create({
            NOME: 'DATA H',
            CNPJ: '55522233344'
        });
        await this.CompanyModel.create({
            NOME: 'HORIZON 4',
            CNPJ: '66622233344'
        });
        await this.CompanyModel.create({
            NOME: 'SANTANDER',
            CNPJ: '77722233344'
        });

        await this.UserModel.create({
            USERNAME: 'Rodrigo',
            PASSWORD: '123'
        });

        /* await this.EmployeeModel.create({
             NOME: 'Rodrigo',
             IDADE: '19',
             DATA_NASCIMENTO: '1998-03-11',
             USER_ID: '1',
 
         });
         */

        //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlJvZHJpZ28iLCJpZFRva2VuIjoiQUFCQkNDIiwiaWF0IjoxNTE3NTc3ODI5fQ.i2RjyH_OwaXKnvGN9Y1NNujHt2gRs4RQtVYPovmLYIo
    }

    async atualizar(nomeAntigo, hero) {
        //Para fazer update passamos dois parametros
        // 1-> Os campos que precisam ser alterados
        // 2-> QUERY(WHERE ATUALIZAR)
        const result = await this.HeroModel.update(
            {
                NOME: hero.nome,
                DATA_NASCIMENTO: hero.data
            },
            {
                where: { NOME: nomeAntigo },
                returning: true,
                plain: true
            });
        return result;
    }
    //===============================================Funcionarios=======================================================
    async listarFuncionarios() {
        const result = await this.EmployeeModel.findAll().map(item => {
            //extraimos os objetos que precisamos
            const { ID, NOME, IDADE, DATA_NASCIMENTO, USER_ID } = item;
            const funcionario = {
                id: ID,
                nome: NOME,
                idade: IDADE,
                data: DATA_NASCIMENTO,
                usuario_id: USER_ID,
            };

            const funcionarioMapeado = new Funcionario(funcionario);
            return funcionarioMapeado;
        });
        return result;
    }

    async cadastrarFuncionarios(employee) {
        const result = await this.EmployeeModel.create
            ({
                NOME: employee.nome,
                IDADE: employee.idade,
                DATA_NASCIMENTO: employee.dataNascimento,
                USER_ID: employee.UserID,
                fk_userId: employee.UserID
            });
        return result;
    }

    async pesquisarFuncionario(id) {
        //Find by id baby
        const result = await this.EmployeeModel.findById(id);
        return result.get({ plain: true });
    }

    async removerFuncionario(id) {
        const result = await this.EmployeeModel.destroy({ where: { ID: id } });
        return result;
    }

    //==================================================== Empresas ===================================================

    async listarEmpresas() {
        const result = await this.CompanyModel.findAll().map(item => {
            //extraimos os objetos que precisamos
            const { ID, NOME, CNPJ } = item;
            const empresa = {
                id: ID,
                nome: NOME,
                cnpj: CNPJ,
            };

            const EmpresaMapeado = new Empresa(empresa);
            return EmpresaMapeado;
        });
        return result;
    }
    //Só caso o Erick queira um plus na aplicação
    /*
        async cadastrarEmpresas(company) {
            const result = await this.CompanyModel.create
                ({
                    NOME: employee.nome,
                    IDADE: employee.idade,
                    DATA_NASCIMENTO: employee.dataNascimento,
                    USUARIO_ID: employee.id,
                });
            return result;
        }
    */
    //========================================================== Usuários===============================

    //Criei essa função apenas para provar que o password retorna criptografado
    async listarUsuarios() {
        const result = await this.CompanyModel.findAll().map(item => {
            //extraimos os objetos que precisamos
            const { ID, USERNAME, PASSWORD } = item;
            const usuario = {
                id: ID,
                username: USERNAME,
                password: PASSWORD,
            };

            const usuarioMapeado = new Usuario(usuario);
            return usuarioMapeado;
        });
        return result;
    }

    async cadastrarUsuarios(user) {
        bcrypt.hash(password, 10, function (err, hash) {
            // Store hash in database
            user.password = hash;
        });
        const result = await this.UserModel.create
            ({
                USERNAME: user.username,
                PASSWORD: user.password,
            });
        return result;
    }

    async pesquisarUserName(username) {
        //Pesquisamos a classe pela descrição, para pesquisar e obter o id do banco
        const result = await this.UserModel.findOne({
            where: { USERNAME: username },
        });
        //return result.get({ plain: true });
        return result;
    }
    async pesquisarPassword(password) {
        //Pesquisamos a classe pela descrição, para pesquisar e obter o id do banco
        const result = await this.UserModel.findOne({
            where: { PASSWORD: password },
        });
        //return result.get({ plain: true });
        return result;
    }



    //=========================================================== Funcionário Empresa===================

    /*async cadastrarFuncionarioEmpresa(employeecompany) {
        const result = await this.EmployeeCompanyModel.create
            ({
                EMPLOYEE_ID: employeecompany.employee_id,
                COMPANY_ID: employeecompany.company_id,
            });
        return result;
    }*/

    // getUsers, setUsers, addUser,addUsers to Project,
    // and getProjects, setProjects, addProject, and addProjects to User.
    //add a new project to a user
    async cadastrarFuncionarioEmpresa(employee, company) {
        const result = employee.addCompany(company);
    }

}
module.exports = DatabaseSQL;