import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SessionGuard } from '../auth/guards';
import { SessionUserId } from '../auth/decorators';

@UseGuards(SessionGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @SessionUserId() sessionUserId: string,
  ) {
    return this.subscriptionService.create({
      createSubscriptionDto,
      userId: sessionUserId,
    });
  }

  @Get()
  findAll(@SessionUserId() sessionUserId: string) {
    return this.subscriptionService.findAll({ userId: sessionUserId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(id);
  }

  @Get(':id/refresh')
  refresh(@Param('id') id: string, @SessionUserId() sessionUserId: string) {
    return this.subscriptionService.refresh({
      subscriptionId: id,
      userId: sessionUserId,
    });
  }
}
