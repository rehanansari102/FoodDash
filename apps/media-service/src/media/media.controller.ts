import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { MediaService } from './media.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() dto: PresignedUrlDto) {
    return this.mediaService.getPresignedUrl(dto);
  }

  @Delete('*key')
  deleteFile(@Param('key') key: string) {
    return this.mediaService.deleteFile(key);
  }
}
