import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { nanoid } from 'nanoid';
import { FileInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { HttpProcessor } from '@/common/decorators/http.decorator';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('upload')
  @HttpProcessor.handle({ message: 'Upload' })
  @UseInterceptors(FileInterceptor('img'))
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const fileArr = file.originalname.split('.');
    const filename = fileArr[0],
      suffix = fileArr[fileArr.length - 1];
    const randomName = `${filename}${nanoid()}.${suffix}`;
    const stream = createWriteStream(join('public/static', randomName));
    const url = `http://121.5.68.110:3001/static/${randomName}`;
    stream.write(file.buffer, (error) => {
      if (error) throw error;
    });
    return url;
  }

  @Get('history')
  @HttpProcessor.handle({ message: 'Get history messages' })
  history(@Query() query: { user_id: string; friend_id: string }) {
    return this.friendService.getAllHistory(query);
  }
}
