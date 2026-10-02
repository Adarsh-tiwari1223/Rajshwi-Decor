import { faker } from '@faker-js/faker';

export interface ReportFilterData {
  reportName: string;
  startDate: string;
  endDate: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}

export class ReportsDataGenerator {
  static generateFilter(overrides: Partial<ReportFilterData> = {}): ReportFilterData {
    const reportNames = ['Lead Conversion Summary', 'Executive Performance', 'Monthly Revenue Pipeline'];
    return {
      reportName: faker.helpers.arrayElement(reportNames),
      startDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      format: faker.helpers.arrayElement(['PDF', 'EXCEL', 'CSV']),
      ...overrides
    };
  }
}
