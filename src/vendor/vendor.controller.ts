import { Controller, Get, UseGuards } from '@nestjs/common';
import { VendorJwt } from './vendor-auth/guard/vendorJwt.guard';
import { GetUser } from 'src/decorator/get-user.decorator';
import { VendorService } from './vendor.service';

@Controller('vendor')
@UseGuards(VendorJwt)
export class VendorController {
    constructor(private readonly vendorService: VendorService) {}
    @Get("overview")
    getOverview(@GetUser() vendor) {
        return this.vendorService.getAdminOverview(vendor.id);
    }
}
