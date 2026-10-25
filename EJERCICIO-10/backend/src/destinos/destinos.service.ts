import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Destino } from './destino.entity';
import { CreateDestinoDto } from './create-destino.dto';
import { UpdateDestinoDto } from './update-destino.dto';

@Injectable()
export class DestinosService implements OnModuleInit {
  constructor(
    @InjectRepository(Destino) private readonly repository: Repository<Destino>,
  ) {}

  async onModuleInit() {
    if ((await this.repository.count()) === 0) {
      await this.repository.save([
        this.repository.create({
          ciudad: 'Kioto',
          pais: 'Japón',
          descripcion: 'Templos antiguos y bosques de bambú',
          visitado: true,
        }),
        this.repository.create({
          ciudad: 'Reikiavik',
          pais: 'Islandia',
          descripcion: 'Auroras boreales y aguas termales',
          visitado: false,
        }),
        this.repository.create({
          ciudad: 'Roma',
          pais: 'Italia',
          descripcion: 'Historia romana, arte y gastronomía',
          visitado: true,
        }),
      ]);
    }
  }

  findAll(visitado?: boolean): Promise<Destino[]> {
    const where: FindOptionsWhere<Destino> = {};
    if (typeof visitado === 'boolean') {
      where.visitado = visitado;
    }
    return this.repository.find({ where, order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<Destino> {
    const x = await this.repository.findOneBy({ id });
    if (!x) throw new NotFoundException('Destino no encontrado');
    return x;
  }

  create(dto: CreateDestinoDto): Promise<Destino> {
    const destino = this.repository.create({
      ...dto,
      visitado: dto.visitado ?? false,
    });
    return this.repository.save(destino);
  }

  async update(id: number, dto: UpdateDestinoDto): Promise<Destino> {
    const x = await this.findOne(id);
    this.repository.merge(x, dto);
    return this.repository.save(x);
  }

  async toggleVisitado(id: number): Promise<Destino> {
    const x = await this.findOne(id);
    x.visitado = !x.visitado;
    return this.repository.save(x);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
