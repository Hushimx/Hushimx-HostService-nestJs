import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assuming you're using Prisma as ORM
import { CryptoService } from 'src/crypto/crypto.service';
import { UUID } from 'crypto';
@Injectable()
export class HostService {
  constructor(private prisma: PrismaService) {}

  async getRoomsByUser(userId: number) {
    return this.prisma.room.findMany({

    });
  }

  async addRoom(userId: number, hotelId: number, roomData: any) {
    // Ensure the hotel belongs to the user
    const hotel = await this.prisma.hotel.findFirst({
      where: {
        id: hotelId,
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found or access denied');
    }
    return this.prisma.room.create({
      data: {
        ...roomData,
        hotelId: hotel.id,
        type: 'Single',
      },
    });
  }

  async deleteRoom(userId: number, roomId: number) {
    // Verify room belongs to a hotel owned by the user
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,

      },
    });

    if (!room) {
      throw new NotFoundException('Access denied: invalid or missing credentials');
    }

    return this.prisma.room.delete({
      where: {
        id: roomId,
      },
    });
  }
}
