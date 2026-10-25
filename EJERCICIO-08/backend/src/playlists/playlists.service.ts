import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './playlist.entity';
import { Cancion } from './cancion.entity';
import { CreateCancionDto } from './create-cancion.dto';

@Injectable()
export class PlaylistsService implements OnModuleInit {
  constructor(
    @InjectRepository(Playlist) private readonly playlists: Repository<Playlist>,
    @InjectRepository(Cancion) private readonly canciones: Repository<Cancion>,
  ) {}

  async onModuleInit() {
    const total = await this.playlists.count();

    if (total === 0) {
      const p1 = await this.playlists.save(
        this.playlists.create({ nombre: 'Entrenamiento' }),
      );
      await this.canciones.save([
        this.canciones.create({
          titulo: 'Run Boy Run',
          artista: 'Woodkid',
          playlist: p1,
        }),
        this.canciones.create({
          titulo: 'Eye of the Tiger',
          artista: 'Survivor',
          playlist: p1,
        }),
      ]);

      const p2 = await this.playlists.save(
        this.playlists.create({ nombre: 'Chill & Relax' }),
      );
      await this.canciones.save(
        this.canciones.create({
          titulo: 'Weightless',
          artista: 'Marconi Union',
          playlist: p2,
        }),
      );
    } else if (total === 1) {
      // Si la base de datos ya tenía 1 playlist de ejecuciones previas, creamos la segunda
      const p2 = await this.playlists.save(
        this.playlists.create({ nombre: 'Chill & Relax' }),
      );
      await this.canciones.save(
        this.canciones.create({
          titulo: 'Weightless',
          artista: 'Marconi Union',
          playlist: p2,
        }),
      );
    }
  }

  findAll(): Promise<Playlist[]> {
    return this.playlists.find({
      relations: { canciones: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Playlist> {
    const playlist = await this.playlists.findOne({
      where: { id },
      relations: { canciones: true },
    });
    if (!playlist) throw new NotFoundException('Playlist no encontrada');
    return playlist;
  }

  async createPlaylist(nombre: string): Promise<Playlist> {
    return this.playlists.save(this.playlists.create({ nombre }));
  }

  async addCancion(playlistId: number, dto: CreateCancionDto): Promise<Cancion> {
    const playlist = await this.playlists.findOneBy({ id: playlistId });
    if (!playlist) throw new NotFoundException('Playlist no encontrada');
    const cancion = this.canciones.create({
      titulo: dto.titulo,
      artista: dto.artista,
      playlist,
    });
    return this.canciones.save(cancion);
  }
}
