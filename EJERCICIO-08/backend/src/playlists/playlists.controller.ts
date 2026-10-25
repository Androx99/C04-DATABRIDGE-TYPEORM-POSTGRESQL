import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreateCancionDto } from './create-cancion.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly service: PlaylistsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body('nombre') nombre: string) {
    return this.service.createPlaylist(nombre || 'Nueva Playlist');
  }

  @Post(':id/canciones')
  addCancion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCancionDto,
  ) {
    return this.service.addCancion(id, dto);
  }

  @Post('canciones')
  addCancionDirect(@Body() dto: CreateCancionDto) {
    return this.service.addCancion(dto.playlistId ?? 1, dto);
  }
}
