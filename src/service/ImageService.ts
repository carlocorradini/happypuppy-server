import cloudinary from 'cloudinary';
import logger from '@app/logger';
import config from '@app/config';

export default class ImageService {
  private static configured: boolean = false;

  public static configure(): void {
    if (this.configured) return;

    cloudinary.v2.config({
      cloud_name: config.SERVICE.IMAGE.CLOUD,
      api_key: config.SERVICE.IMAGE.KEY,
      api_secret: config.SERVICE.IMAGE.SECRET,
    });

    this.configured = true;

    logger.info('Image service configured');
  }

  public static upload(
    image: Express.Multer.File,
    options?: cloudinary.UploadApiOptions
  ): Promise<cloudinary.UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(options, (err, result) => {
          if (err) {
            logger.error(`Error uploading image due to ${err.message}`);
            reject(err);
          } else {
            logger.info(`Uploaded image ${JSON.stringify(result)}`);
            resolve(result);
          }
        })
        .end(image.buffer);
    });
  }
}
