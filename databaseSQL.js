#!/usr/bin/env node
const Sequelize = require('sequelize');
const Funcionario = require('./funcionario');
const Usuario = require('./usuario');
const Empresa = require('./empresa');
const FuncionarioEmpresa = require('./funcionarioempresa');
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
            //USUARIO_ID: Sequelize.INTEGER,
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

        this.EmployeeCompanyModel = this.ImersaoNudesJS.define('EmployeesCompanies', {
            ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            FUNCIONARIO_ID: Sequelize.INTEGER,
            EMPRESA_ID: Sequelize.INTEGER,
        });


        //Relacionamento 1 pra 1
        this.EmployeeModel.belongsTo(this.UserModel);
        //Relacionamento Muitos pra Muitos
        this.EmployeeModel.hasMany(this.EmployeeCompanyModel);
        this.CompanyModel.hasMany(this.EmployeeCompanyModel);



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

    }

    async remover(nome) {
        const result = await this.HeroModel.destroy({ where: { NOME: nome } });
        return result;
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
            const { ID, NOME, IDADE, DATA_NASCIMENTO, USUARIO_ID } = item;
            const funcionario = {
                id: ID,
                nome: NOME,
                idade: IDADE,
                data: DATA_NASCIMENTO,
                //usuario: USUARIO_ID,
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
                //USUARIO_ID: employee.id,
            });
        return result;
    }

    async pesquisarFuncionario(id) {
        //Pesquisamos a classe pela descrição, para pesquisar e obter o id do banco
        const result = await this.EmployeeModel.findOne({
            where: { ID: id },
        });
        return result.get({ plain: true });
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

    async cadastrarUsuarios(user) {
        const result = await this.UserModel.create
            ({
                USERNAME: user.username,
                PASSWORD: user.password,
            });
        return result;
    }

    //=========================================================== Funcionário Empresa===================

    async cadastrarFuncionarioEmpresa(employeecompany) {
        const result = await this.EmployeeCompanyModel.create
            ({
                EMPLOYEE_ID: employeecompany.employee_id,
                COMPANY_ID: employeecompany.company_id,
            });
        return result;
    }



}
module.exports = DatabaseSQL;