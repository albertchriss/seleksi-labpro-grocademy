import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { MediaService } from './media.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('media')
@Controller('api/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id/view')
  async viewFile(@Param('id') id: string, @Res() res: Response) {
    const { url } = await this.mediaService.getMediaUrl(id);
    return res.redirect(url);
  }
}
