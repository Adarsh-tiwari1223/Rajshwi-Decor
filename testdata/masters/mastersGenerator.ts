import { faker } from '@faker-js/faker';

export interface MasterItemData {
  category: string;
  name: string;
  code: string;
  description: string;
}

export class MastersDataGenerator {
  static generate(overrides: Partial<MasterItemData> = {}): MasterItemData {
    const categories = ['Lead Source', 'Requirement Type', 'Property Type', 'Budget Range', 'Follow-up Status'];
    return {
      category: faker.helpers.arrayElement(categories),
      name: faker.commerce.productName(),
      code: `MST-${faker.string.alphanumeric(6).toUpperCase()}`,
      description: faker.commerce.productDescription(),
      ...overrides
    };
  }
}
