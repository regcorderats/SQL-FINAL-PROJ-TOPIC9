import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { DailyReportDto } from './dto/daily-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary() {
    return this.reportsService.getSystemSummary();
  }

  @Get('daily-activities')
  getDailyActivities(@Query() filter: DailyReportDto) {
    return this.reportsService.getDailyActivities(filter);
  }
}