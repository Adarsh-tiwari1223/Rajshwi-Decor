import { faker } from '@faker-js/faker';

export interface UserSettingsData {
  firstName: string;
  lastName: string;
  fullName: string;
  officialEmail: string;
  personalEmail: string;
  phone: string;
  role: string;
  department: string;
  employeeId: string;
  city: string;
}

const REAL_STAFF_PROFILES = [
  { firstName: 'Pooja', lastName: 'Verma', role: 'Principal Interior Designer', department: 'Design & Concepts', city: 'Mumbai' },
  { firstName: 'Amit', lastName: 'Sharma', role: 'Senior 3D Visualizer', department: 'Design & 3D Modeling', city: 'Delhi NCR' },
  { firstName: 'Rohan', lastName: 'Malhotra', role: 'Key Account Manager - Sales', department: 'Sales & Client Relations', city: 'Bengaluru' },
  { firstName: 'Sneha', lastName: 'Iyer', role: 'Modular Furniture Architect', department: 'Product Design', city: 'Pune' },
  { firstName: 'Vikram', lastName: 'Singhania', role: 'Turnkey Project Execution Lead', department: 'Project Operations', city: 'Hyderabad' },
  { firstName: 'Neha', lastName: 'Kapoor', role: 'Customer Success & Handover Specialist', department: 'Operations', city: 'Jaipur' }
];

export class SettingsDataGenerator {
  static generateUser(overrides: Partial<UserSettingsData> = {}): UserSettingsData {
    const profile = faker.helpers.arrayElement(REAL_STAFF_PROFILES);
    const firstName = overrides.firstName || profile.firstName;
    const lastName = overrides.lastName || profile.lastName;
    const fullName = `${firstName} ${lastName}`;

    const num = faker.number.int({ min: 10, max: 99 });
    const officialEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@rajasvidecor.com`;
    const personalEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@gmail.com`;
    const phone = `+91${faker.helpers.arrayElement(['98', '99', '97', '91', '88'])}${faker.string.numeric(8)}`;
    const empNum = faker.number.int({ min: 101, max: 899 });

    return {
      firstName,
      lastName,
      fullName,
      officialEmail,
      personalEmail,
      phone,
      role: profile.role,
      department: profile.department,
      employeeId: `RD-EMP-${empNum}`,
      city: profile.city,
      ...overrides
    };
  }
}
