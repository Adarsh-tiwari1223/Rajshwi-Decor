import { fakerEN_IN as faker } from '@faker-js/faker';

export interface LeadData {
  customerName: string;
  phone: string;
  email: string;
  requirement: string;
  propertyType: string;
  budget: string;
  city: string;
  locality: string;
  address: string;
  pincode: string;
  notes: string;
}

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Rohan', 'Aditya', 'Vikram', 'Pooja', 'Neha', 'Ananya', 'Rahul',
  'Siddharth', 'Priyanka', 'Amit', 'Sneha', 'Deepak', 'Meera', 'Varun', 'Kavita',
  'Arjun', 'Ritu', 'Manish', 'Shreya', 'Karan', 'Tanvi', 'Rajesh', 'Divya'
];

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Malhotra', 'Kapoor', 'Gupta', 'Mehta', 'Iyer', 'Singhania',
  'Joshi', 'Chopra', 'Patel', 'Reddy', 'Agarwal', 'Bansal', 'Nair', 'Bhatia',
  'Deshmukh', 'Trivedi', 'Saxena', 'Kulkarni'
];

const REAL_REQUIREMENTS = [
  'Modular Kitchen & Living Room Interior Decor',
  'Complete 3BHK Turnkey Interior Architecture',
  'Luxury False Ceiling & Ambient Profile Lighting',
  'Custom Italian Marble Flooring & Wall Paneling',
  'Master Bedroom Wardrobe & Vanity Design',
  'Luxury Velvet Curtains & Acoustic Wooden Paneling',
  'Commercial Boutique Office & Reception Interior',
  'Villa Terrace Garden & Pergola Louver Work'
];

const REAL_PROPERTY_TYPES = [
  '3BHK High-Rise Apartment',
  '4BHK Luxury Penthouse',
  'Duplex Villa',
  'Independent Floor',
  'Commercial Office Space',
  'Retail Showroom'
];

const REAL_INDIAN_LOCALITIES = [
  { city: 'Mumbai', locality: 'Bandra West', pincode: '400050' },
  { city: 'Mumbai', locality: 'Powai Hiranandani', pincode: '400076' },
  { city: 'Delhi NCR', locality: 'Sector 54, Golf Course Road, Gurgaon', pincode: '122002' },
  { city: 'Delhi NCR', locality: 'Sector 62, Noida', pincode: '201309' },
  { city: 'Delhi NCR', locality: 'Greater Kailash II, New Delhi', pincode: '110048' },
  { city: 'Bengaluru', locality: 'Indiranagar 100ft Road', pincode: '560038' },
  { city: 'Bengaluru', locality: 'Whitefield', pincode: '560066' },
  { city: 'Bengaluru', locality: 'Koramangala 4th Block', pincode: '560034' },
  { city: 'Pune', locality: 'Koregaon Park', pincode: '411001' },
  { city: 'Pune', locality: 'Baner Balewadi', pincode: '411045' },
  { city: 'Hyderabad', locality: 'Jubilee Hills Checkpost', pincode: '500033' },
  { city: 'Hyderabad', locality: 'Gachibowli Financial District', pincode: '500032' },
  { city: 'Jaipur', locality: 'C-Scheme, Ashok Nagar', pincode: '302001' },
  { city: 'Jaipur', locality: 'Vaishali Nagar', pincode: '302021' },
  { city: 'Ahmedabad', locality: 'SG Highway, Bodakdev', pincode: '380054' }
];

const REAL_CLIENT_NOTES = [
  'Client requested initial 3D design concept consultation on weekend.',
  'Possession expected next month. Needs turnkey execution within 60 days.',
  'Prefers minimalist contemporary Scandinavian theme with warm wood finishes.',
  'Interested in premium German hardware (Hettich/Hafele) for kitchen cabinets.',
  'Met via walk-in inquiry at showroom. Requested catalogue and cost breakdown.',
  'Client wants smart home automation integration with motorized curtain tracks.'
];

export class LeadDataGenerator {
  static generate(overrides: Partial<LeadData> = {}): LeadData {
    const firstName = faker.helpers.arrayElement(INDIAN_FIRST_NAMES);
    const lastName = faker.helpers.arrayElement(INDIAN_LAST_NAMES);
    const customerName = `${firstName} ${lastName}`;
    
    // Natural email format (e.g. rohan.sharma92@gmail.com, priya.kapoor@outlook.com)
    const emailDomains = ['gmail.com', 'outlook.com', 'yahoo.co.in', 'icloud.com'];
    const domain = faker.helpers.arrayElement(emailDomains);
    const num = faker.number.int({ min: 11, max: 99 });
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@${domain}`;

    // Realistic Indian 10-digit mobile number starting with 9, 8, or 7
    const phone = `+91${faker.helpers.arrayElement(['98', '99', '97', '96', '91', '88', '70'])}${faker.string.numeric(8)}`;

    const locationObj = faker.helpers.arrayElement(REAL_INDIAN_LOCALITIES);
    const houseNo = faker.number.int({ min: 101, max: 1404 });
    const address = `Flat ${houseNo}, Tower ${faker.helpers.arrayElement(['A', 'B', 'C', 'Emerald', 'Imperial'])}, ${locationObj.locality}`;

    const budgets = [
      '₹4,50,000 - ₹7,00,000',
      '₹8,00,000 - ₹12,00,000',
      '₹15,00,000 - ₹25,00,000',
      '₹30,00,000 - ₹50,00,000'
    ];

    return {
      customerName,
      phone,
      email,
      requirement: faker.helpers.arrayElement(REAL_REQUIREMENTS),
      propertyType: faker.helpers.arrayElement(REAL_PROPERTY_TYPES),
      budget: faker.helpers.arrayElement(budgets),
      city: locationObj.city,
      locality: locationObj.locality,
      address,
      pincode: locationObj.pincode,
      notes: faker.helpers.arrayElement(REAL_CLIENT_NOTES),
      ...overrides
    };
  }
}

export interface ContactData {
  contactPersonName: string;
  contactPersonNumber: string;
  email: string;
  country: string;
  state: string;
  city: string;
  source: string;
}

const INDIAN_STATE_CITY_MAP = [
  { state: 'Maharashtra', city: 'Mumbai' },
  { state: 'Maharashtra', city: 'Pune' },
  { state: 'Delhi', city: 'New Delhi' },
  { state: 'Rajasthan', city: 'Jaipur' },
  { state: 'Karnataka', city: 'Bengaluru' },
  { state: 'Gujarat', city: 'Ahmedabad' }
];

const CONTACT_SOURCES = [
  'Facebook',
  'Instagram',
  'Google Ads'
];

export class ContactDataGenerator {
  static generate(overrides: Partial<ContactData> = {}): ContactData {
    const firstName = faker.helpers.arrayElement(INDIAN_FIRST_NAMES);
    const lastName = faker.helpers.arrayElement(INDIAN_LAST_NAMES);
    const contactPersonName = `${firstName} ${lastName}`;

    const domain = faker.helpers.arrayElement(['gmail.com', 'outlook.com', 'yahoo.co.in']);
    const num = faker.number.int({ min: 10, max: 99 });
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@${domain}`;

    // 10-digit authentic Indian mobile without prefix
    const contactPersonNumber = `${faker.helpers.arrayElement(['98', '99', '97', '91', '88', '70'])}${faker.string.numeric(8)}`;

    const location = faker.helpers.arrayElement(INDIAN_STATE_CITY_MAP);
    const source = faker.helpers.arrayElement(CONTACT_SOURCES);

    return {
      contactPersonName,
      contactPersonNumber,
      email,
      country: 'India',
      state: location.state,
      city: location.city,
      source,
      ...overrides
    };
  }
}

