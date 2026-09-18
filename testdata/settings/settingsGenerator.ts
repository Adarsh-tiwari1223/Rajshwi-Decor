import { faker } from '@faker-js/faker';

export interface UserSettingsData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export class SettingsDataGenerator {
  static generateUser(overrides: Partial<UserSettingsData> = {}): UserSettingsData {
    const roles = ['Admin', 'Sales Manager', 'Interior Designer', 'Telecaller', 'Executive'];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.helpers.fromRegExp('+919[0-9]{9}'),
      role: faker.helpers.arrayElement(roles),
      ...overrides
    };
  }
}
