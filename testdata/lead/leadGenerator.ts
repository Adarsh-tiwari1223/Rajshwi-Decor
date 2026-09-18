import { fakerEN_IN as faker } from '@faker-js/faker';

export interface LeadData {
  customerName: string;
  phone: string;
  email: string;
  requirement: string;
  budget: string;
  city: string;
  state: string;
  address: string;
  pinCode: string;
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
      'Wallpaper & Wall Paneling',
      'Wooden Flooring & Wardrobes',
      'False Ceiling & Lighting Design'
    ];

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const customerName = `${firstName} ${lastName}`;

    return {
      customerName,
      phone: faker.helpers.fromRegExp('+91[6-9][0-9]{9}'),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      requirement: faker.helpers.arrayElement(requirements),
      budget: `₹${faker.number.int({ min: 150000, max: 3500000 }).toLocaleString('en-IN')}`,
      city: faker.location.city(),
      state: faker.location.state(),
      address: faker.location.streetAddress(),
      pinCode: faker.location.zipCode('######'),
      notes: faker.lorem.sentence(),
      ...overrides
    };
  }
}
