import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SessionGuard } from '../auth/guards';
import { User } from '../schemas/user.schema';

@UseGuards(SessionGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Session() session: { user?: User & { _id: string } },
  ) {
    // TODO: get user ID via decorator
    return this.subscriptionService.create({
      createSubscriptionDto,
      userId: session.user?._id,
    });
  }

  @Get()
  findAll(@Session() session: { user?: User & { _id: string } }) {
    // TODO: get user ID via decorator
    return this.subscriptionService.findAll({ userId: session.user?._id });
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
  refresh(
    @Param('id') id: string,
    @Session() session: { user?: User & { _id: string } },
  ) {
    return this.subscriptionService.refresh({
      subscriptionId: id,
      userId: session.user?._id,
    });
  }
}
