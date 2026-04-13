import { IsString, IsIn, MaxLength } from 'class-validator';

// Allowed file types for upload
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class PresignedUrlDto {
  // Original filename — used to generate the object key
  @IsString() @MaxLength(200) fileName: string;

  // MIME type — validated to prevent non-image uploads
  @IsString() @IsIn(ALLOWED_TYPES, {
    message: `contentType must be one of: ${ALLOWED_TYPES.join(', ')}`,
  })
  contentType: string;

  // Which folder to upload into: restaurants, menus, avatars
  @IsString() @IsIn(['restaurants', 'menus', 'avatars']) folder: string;
}
