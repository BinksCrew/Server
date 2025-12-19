import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

interface ImgBBResponse {
  data: {
    url: string;
  };
  success: boolean;
  status: number;
}

@Injectable()
export class ImageUploadService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const apiKey = this.configService.get<string>('IMGBB_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('IMGBB_API_KEY is not defined');
    }

    const formData = new FormData();
    formData.append('image', file.buffer.toString('base64'));

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<ImgBBResponse>(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          formData,
        ),
      );
      return data.data.url;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error uploading image to ImgBB');
    }
  }
}
