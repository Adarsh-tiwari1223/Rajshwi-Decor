import { faker } from '@faker-js/faker';

export interface LeadData {
  customerName: string;
  phone: string;
  email: string;
  requirement: string;
  budget: string;
  city: string;
  address: string;
  notes: string;
}

export class LeadDataGenerator {
  static generate(overrides: Partial<LeadData> = {}): LeadData {
    const requirements = [
      'Modular Kitchen Design',
      'Living Room Interior Decor',
      'Full 3BHK Villa Interior',
      'Curtains & Luxury Furnishing',
      'Commercial Office Renovation',
      'Wallpaper & Wall Paneling'
    ];

    return {
      customerName: faker.person.fullName(),
      phone: faker.helpers.fromRegExp('+919[0-9]{9}'),
      email: faker.internet.email().toLowerCase(),
      requirement: faker.helpers.arrayElement(requirements),
      budget: `₹${faker.number.int({ min: 100000, max: 2500000 }).toLocaleString('en-IN')}`,
      city: faker.location.city(),
      address: faker.location.streetAddress(),
      notes: faker.lorem.sentence(),
      ...overrides
    };
  }
}
