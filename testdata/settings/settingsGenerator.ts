import { fakerEN_IN as faker } from '@faker-js/faker';

export interface UserSettingsData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
}

export class SettingsDataGenerator {
  static generateUser(overrides: Partial<UserSettingsData> = {}): UserSettingsData {
    const roles = ['Admin', 'Sales Manager', 'Interior Designer', 'Telecaller', 'Site Supervisor'];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.helpers.fromRegExp('+91[6-9][0-9]{9}'),
      city: faker.location.city(),
      role: faker.helpers.arrayElement(roles),
      ...overrides
    };
  }
}
