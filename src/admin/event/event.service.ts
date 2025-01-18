import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort } from 'src/utils/pagination';
import { Role, Permission } from 'src/admin/auth/role-permission-service/rolesData';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { QueryEventDto } from './dto/query-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { buildFilters } from 'src/utils/filters';
import { PhotoStorageService } from 'src/photo-storage/photo-storage.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly photoStorageService: PhotoStorageService
  ) {}

  async getEvents(query: QueryEventDto, userRole: Role, userCountryId?: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_EVENTS);

    const filters = buildFilters({ userRole, userCountryId, dto: query, allowedFields: ['title'] });

    

    const allowedSortFields = ['title', 'createdAt', 'updatedAt'];

    return paginateAndSort(
      this.prisma.event,
      {
        where: filters,
        include: { city: true },
      },
      {
        page: query.page,
        limit: query.limit,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      allowedSortFields,
    );
  }

  async getEvent(eventId: number, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_EVENTS);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { city: { select: { name: true, countryId: true } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.VIEW_EVENTS,
      userCountryId,
      event.city.countryId,
    );

    return event;
  }

  async createEvent(data: CreateEventDto, userRole: Role, userCountryId?: number,file?: Express.Multer.File,) {
    this.rolePermissionService.enforcePermission(userRole, Permission.MANAGE_EVENTS);

    const city = await this.prisma.city.findUnique({
      where: { id: data.cityId },
      include: { country: true },
    });

    if (!city) {
      throw new NotFoundException('City not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.MANAGE_EVENTS,
      userCountryId,
      city.country.id,
    );
    const photoPath = file ? await this.photoStorageService.savePhoto(file, 'events') : null;


    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        description_ar: data.description_ar,
        address: data.address,
        locationUrl: data.locationUrl,
        cityId: data.cityId,
        image: photoPath
      },
    });
  }

  async editEvent(
    eventId: number,
    data: UpdateEventDto,
    userRole: Role,
    userCountryId: number,
    file: Express.Multer.File
  ) {
    this.rolePermissionService.enforcePermission(userRole, Permission.MANAGE_EVENTS);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { city: { include: { country: true } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.MANAGE_EVENTS,
      userCountryId,
      event.city.country.id,
    );

    let imagePath = event.image;
    if (file) {
      const newPhotoPath = await this.photoStorageService.savePhoto(file, 'products');
      if (imagePath) this.photoStorageService.deletePhoto(imagePath);
      imagePath = newPhotoPath;
    }


    return this.prisma.event.update({
      where: { id: eventId },
      data:{
        ...data,
        image: imagePath
      }
    });
  }

  async deleteEvent(eventId: number, userRole: Role, userCountryId?: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_EVENTS);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { city: { include: { country: true } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.DELETE_EVENTS,
      userCountryId,
      event.city.country.id,
    );

    return this.prisma.event.delete({
      where: { id: eventId },
    });
  }
}
