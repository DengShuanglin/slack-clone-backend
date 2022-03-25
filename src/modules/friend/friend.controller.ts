import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FriendService } from './friend.service';
import { nanoid } from 'nanoid';
import { FileInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { UserAndFriendId } from './friend.model';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('img'))
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() body: UserAndFriendId,
  ) {
    const fileArr = file.originalname.split('.');
    const filename = fileArr[0],
      suffix = fileArr[fileArr.length - 1];
    const randomName = `${filename}${nanoid()}.${suffix}`;
    const stream = createWriteStream(join('public/static', randomName));
    const url = `http://121.5.68.110:3001/static/${randomName}`;
    stream.write(file.buffer, (error) => {
      !error && this.friendService.addImgMessage(url, body);
    });
    return url;
  }
}
