import { fakerEN_IN as faker } from '@faker-js/faker';

export interface MasterItemData {
  category: string;
  name: string;
  code: string;
  description: string;
}

export class MastersDataGenerator {
  static generate(overrides: Partial<MasterItemData> = {}): MasterItemData {
    const categories = [
      'Lead Source (Justdial, IndiaMART, Walk-in, Housing.com, Referral)',
      'Requirement Type (2BHK, 3BHK, Villa, Penthouse, Commercial)',
      'Budget Tier (Economy ₹2L-5L, Premium ₹5L-15L, Luxury ₹15L+)',
      'Site Status (Under Construction, Ready to Move, Renovation)'
    ];

    return {
      category: faker.helpers.arrayElement(categories),
      name: faker.commerce.productName(),
      code: `MST-IN-${faker.string.alphanumeric(6).toUpperCase()}`,
      description: faker.commerce.productDescription(),
      ...overrides
    };
  }
}
