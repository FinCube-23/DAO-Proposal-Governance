import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Module({
  imports: [],
  providers: [TasksService],
})
export class TasksModule {}