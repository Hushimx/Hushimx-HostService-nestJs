import { Controller, Get, ParseIntPipe, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { GetUser } from 'src/decorator/get-user.decorator';
import { OverviewDto } from '../dto/overview.dto';
import { AdminJwt } from './auth/guard';
import { Admin } from '@prisma/client';

@Controller('admin')
@UseGuards(AdminJwt)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getAdminOverview(@GetUser() user : Admin,@Query(new ValidationPipe({ transform: true, whitelist: true })) query : OverviewDto) {
    return this.adminService.getAdminOverview(user.role,user.countryId,query.country);
  }
}
