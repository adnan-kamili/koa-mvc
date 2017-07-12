import { Controller, Body, Post, Ctx, UnauthorizedError, BadRequestError } from "routing-controllers";
import { hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import * as config from "config";

import { Repository } from "../repository/Repository";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { Tenant } from "../models/Tenant";
import { RegisterViewModel } from "../viewModels/RegisterViewModel";

const jwtConfig = config.get("jwt");

@Controller("/accounts")
export class AccountsController {

    userRepository: any;
    roleRepository: any;
    tenantRepository: any;

    constructor(private repository: Repository) {
        this.userRepository = repository.getRepository(User);
        this.roleRepository = repository.getRepository(Role);
        this.tenantRepository = repository.getRepository(Tenant);
    }
    // use transaction
    @Post()
    async create( @Ctx() ctx: any, @Body() viewModel: RegisterViewModel) {

        const tenant = new Tenant();
        tenant.company = viewModel.company;
        await this.tenantRepository.persist(tenant);
        const role = this.roleRepository.create({
            name: "admin",
            description: "admin role",
            tenantId: tenant.id,
        });
        await this.roleRepository.persist(role);
        const user = this.userRepository.create(viewModel);
        user.email = user.email.toLowerCase();
        if (await this.userRepository.findOne({ where: { email: user.email } })) {
            throw new BadRequestError(`email '${viewModel.email}' already exists!`);
        }
        user.tenantId = tenant.id;
        user.lastLogin = new Date();
        user.password = await hash(viewModel.password, 10);
        user.roles = [role];
        await this.userRepository.persist(user);
        return { message: "account created sucessfully!" };
    }
}