import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { GetUser } from 'src/decorator/get-user.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getAdminOverview(@GetUser() user,@Query("country", ParseIntPipe) query) {
    return this.adminService.getAdminOverview(user.role,user.countyId,query);
  }
}
