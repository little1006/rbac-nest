import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WallpaperService } from './wallpaper.service';
import { Wallpaper } from './entities/wallpaper.entity';
import { NotFoundException } from '@nestjs/common';

const mockWallpaper = {
  id: '_5R5kcRJavM',
  slug: 'test-wallpaper',
  alternative_slugs: {
    en: 'test-wallpaper-en',
    es: 'test-wallpaper-es',
    ja: 'test-wallpaper-ja',
    fr: 'test-wallpaper-fr',
    it: 'test-wallpaper-it',
    ko: 'test-wallpaper-ko',
    de: 'test-wallpaper-de',
    pt: 'test-wallpaper-pt'
  },
  created_at: new Date(),
  updated_at: new Date(),
  promoted_at: new Date(),
  width: 1920,
  height: 1080,
  color: '#000000',
  blur_hash: 'test-hash',
  description: 'test description',
  alt_description: 'test alt description',
  breadcrumbs: [],
  urls: {
    raw: 'test-raw-url',
    full: 'test-full-url',
    regular: 'test-regular-url',
    small: 'test-small-url',
    thumb: 'test-thumb-url',
    small_s3: 'test-small-s3-url'
  },
  links: {
    self: 'test-self-link',
    html: 'test-html-link',
    download: 'test-download-link',
    download_location: 'test-download-location-link'
  },
  likes: 0,
  liked_by_user: false,
  current_user_collections: [],
  sponsorship: null,
  topic_submissions: {},
  asset_type: 'photo',
  user: {
    id: 'test-user-id',
    updated_at: new Date(),
    username: 'test-user',
    name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    twitter_username: null,
    portfolio_url: null,
    bio: null,
    location: null,
    links: {
      self: 'test-user-self-link',
      html: 'test-user-html-link',
      photos: 'test-user-photos-link',
      likes: 'test-user-likes-link',
      portfolio: 'test-user-portfolio-link',
      following: 'test-user-following-link',
      followers: 'test-user-followers-link'
    },
    profile_image: {
      small: 'test-profile-small',
      medium: 'test-profile-medium',
      large: 'test-profile-large'
    },
    instagram_username: null,
    total_collections: 0,
    total_likes: 0,
    total_photos: 0,
    total_promoted_photos: 0,
    total_illustrations: 0,
    total_promoted_illustrations: 0,
    accepted_tos: true,
    for_hire: false,
    social: {
      instagram_username: null,
      portfolio_url: null,
      twitter_username: null,
      paypal_email: null
    }
  },
  _metadata: {
    saved_at: new Date(),
    source: 'test'
  }
};

describe('WallpaperService', () => {
  let service: WallpaperService;
  let repository: Repository<Wallpaper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WallpaperService,
        {
          provide: getRepositoryToken(Wallpaper),
          useValue: {
            find: jest.fn().mockResolvedValue([mockWallpaper]),
            findOne: jest.fn().mockResolvedValue(mockWallpaper),
            save: jest.fn().mockResolvedValue(mockWallpaper),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<WallpaperService>(WallpaperService);
    repository = module.get<Repository<Wallpaper>>(getRepositoryToken(Wallpaper));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of wallpapers', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockWallpaper]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a wallpaper', async () => {
      const result = await service.findOne('test-id');
      expect(result).toEqual(mockWallpaper);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
    });

    it('should throw NotFoundException when wallpaper not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne('test-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a wallpaper', async () => {
      const result = await service.create(mockWallpaper);
      expect(result).toEqual(mockWallpaper);
      expect(repository.save).toHaveBeenCalledWith(mockWallpaper);
    });
  });

  describe('update', () => {
    it('should update a wallpaper', async () => {
      const updateData = { description: 'updated description' };
      const result = await service.update('test-id', updateData);
      expect(result).toEqual({ ...mockWallpaper, ...updateData });
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when wallpaper not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.update('test-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a wallpaper', async () => {
      await service.remove('test-id');
      expect(repository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException when wallpaper not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValueOnce({ raw: null, affected: 0 });
      await expect(service.remove('test-id')).rejects.toThrow(NotFoundException);
    });
  });
});