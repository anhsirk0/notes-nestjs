import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities';
import { SignupDto } from './dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(username: string): Promise<User> {
    return this.usersRepository.findOneBy({ username });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async signin(dto) {
    let user;
    user = await this.usersRepository.findOne({
      where: { username: dto.username },
    });

    if (!user) throw new BadRequestException('User not exists');
    // console.log(user, dto);
    let passMatch;
    passMatch = await argon2.verify(user.password, dto.password);

    if (!passMatch) throw new UnauthorizedException('Invalid Credentials');

    return { status: '200', message: 'Hello signin' };
  }

  async signup(dto: SignupDto) {
    let user;
    user = await this.usersRepository.findOne({
      where: { username: dto.username },
    });

    console.log(user);

    if (user) throw new BadRequestException('Account already exists');

    user = await this.usersRepository.create(dto);
    user = await this.usersRepository.save(user);

    return { status: '200', message: 'Hello signup' };
  }
}
