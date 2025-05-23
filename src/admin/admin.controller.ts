import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { GetUser } from '../auth/decorator';
import { Role } from '../auth/enum';
import { Roles } from '../auth/decorator/role-decorator';
import { User } from '@prisma/client';
import { UpdatePasswordDto } from '../user/dto';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from '../auth/guard/role.guard';

@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unathorized' })
@ApiInternalServerErrorResponse({ description: 'Internal Server error' })
@UseGuards(JwtGuard, RolesGuard)
@Controller('host')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: 'create other admin account',
    description: 'Super admin can create other admin account',
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiCreatedResponse({ description: 'Created' })
  @Post('create')
  @Roles(Role.Admin)
  createAdmin(@GetUser() admin: { id: string }, @Body() dto: CreateAdminDto) {
    if (admin) return this.adminService.createAdmin(dto);
  }

  @ApiOperation({
    summary: 'view all admins as an admin',
    description: 'Admin with admin role can view all admins',
  })
  @ApiOkResponse({ description: 'Ok' })
  @Get('all')
  @Roles(Role.Admin)
  viewAllAdmin(@GetUser() admin: User) {
    if (admin) return this.adminService.viewAllAdmin();
  }

  @ApiOperation({
    summary: 'view my details as a loggedin admin',
    description: 'Admin can view their details',
  })
  @ApiOkResponse({ description: 'Ok' })
  @Get('me')
  @Roles(Role.Admin)
  viewMe(@GetUser() admin: User) {
    return this.adminService.viewMe(admin.id);
  }

  @ApiOperation({
    summary: 'save my fcm token as a loggedin admin',
    description: 'Save my fcm token as a loggedin admin',
  })
  @ApiBody({
    description: 'Device ID',
    type: String,
    required: true,
    schema: {
      properties: {
        token: {
          example: 'your-device-id',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  @Post('me')
  saveAdminFcmToken(@GetUser('id') id: string, @Body('token') token: string) {
    return this.adminService.saveAdminFcmToken(id, token);
  }

  @ApiOperation({
    summary: 'update my details as a loggedin admin',
    description: 'Admin can update their details',
  })
  @ApiAcceptedResponse({ description: 'Accepted' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Patch('me')
  @Roles(Role.Admin)
  updateProfile(@GetUser('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.updateProfile(id, dto);
  }

  @ApiOperation({
    summary: 'update my password as a loggedin admin',
    description: 'Admin can update their password',
  })
  @ApiAcceptedResponse({ description: 'Accepted' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  @Patch('me/password')
  @Roles(Role.Admin)
  updatePassword(@GetUser('id') id: string, @Body() dto: UpdatePasswordDto) {
    return this.adminService.updatePassword(id, dto);
  }

  @ApiOperation({
    summary: 'delete an admin',
    description: 'Admin with admin role can delete an admin by id',
  })
  @ApiNoContentResponse({ description: 'No content' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(Role.Admin)
  deleteAdmin(@GetUser() admin: User, @Param('id') id: string) {
    if (admin) return this.adminService.deleteAdmin(id);
  }
}
