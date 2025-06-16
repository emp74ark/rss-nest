import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SourceSubscription } from '../schemas/subscription.schema';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel('Subscription')
    private subscriptionModel: Model<SourceSubscription>,
  ) {}

  async create({
    createSubscriptionDto,
    userId,
  }: {
    createSubscriptionDto: CreateSubscriptionDto;
    userId?: string;
  }) {
    return this.subscriptionModel.create({
      ...createSubscriptionDto,
      userId: userId,
    });
  }

  async findAll({ userId }: { userId?: string }) {
    return await this.subscriptionModel.find({ userId: userId }).exec();
  }

  async findOne(id: string) {
    const subscription = await this.subscriptionModel
      .findOne({ _id: id })
      .exec();
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionModel
      .findByIdAndUpdate(id, updateSubscriptionDto, { new: true })
      .exec();
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async remove(id: string) {
    return this.subscriptionModel.findByIdAndDelete(id).exec();
  }
}
