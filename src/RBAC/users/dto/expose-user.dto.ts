import { Expose, Transform } from 'class-transformer';
import * as dayjs from 'dayjs';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  status: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @Transform(({ value }) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : null,
  )
  createdAt: string;

  @Expose()
  @Transform(({ value }) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : null,
  )
  updatedAt: string;
}
