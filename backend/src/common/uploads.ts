import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

export const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1' || value === 'on';

export const optionalImage = () =>
  new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
      new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
    ],
  });

export const requiredPdf = () =>
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 15 * 1024 * 1024 }),
      new FileTypeValidator({ fileType: /^application\/pdf$/ }),
    ],
  });
