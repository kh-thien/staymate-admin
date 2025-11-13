import { financialReportService } from './financialReportService';
import { occupancyReportService } from './occupancyReportService';
import { maintenanceReportService } from './maintenanceReportService';
import { dashboardService } from './dashboardService';
import { contractReportService } from './contractReportService';

export const reportService = {
  ...financialReportService,
  ...occupancyReportService,
  ...maintenanceReportService,
  ...dashboardService,
  ...contractReportService,
};
