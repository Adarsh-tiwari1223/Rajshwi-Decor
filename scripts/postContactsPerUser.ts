import { request } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fakerEN_IN as faker } from '@faker-js/faker';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_BASE_URL = process.env.API_BASE_URL || 'https://crm-stg-api.rajasvidecor.com';

export interface UserCreds {
  displayName: string;
  email: string;
  password: string;
}

export const CRM_USERS: UserCreds[] = [
  {
    displayName: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@rajasvidecor.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123'
  },
  {
    displayName: 'Rahul Sharma',
    email: process.env.USER_RAHUL_EMAIL || 'rahul.sharma@gmail.com',
    password: process.env.USER_RAHUL_PASSWORD || 'password123'
  },
  {
    displayName: 'Priya Patel',
    email: process.env.USER_PRIYA_EMAIL || 'priya.patel@gmail.com',
    password: process.env.USER_PRIYA_PASSWORD || 'password123'
  },
  {
    displayName: 'Amit Verma',
    email: process.env.USER_AMIT_EMAIL || 'amit.verma@gmail.com',
    password: process.env.USER_AMIT_PASSWORD || 'password123'
  },
  {
    displayName: 'Sneha Joshi',
    email: process.env.USER_SNEHA_EMAIL || 'sneha.joshi@gmail.com',
    password: process.env.USER_SNEHA_PASSWORD || 'password123'
  },
  {
    displayName: 'Vikas Mehta',
    email: process.env.USER_VIKAS_EMAIL || 'vikas.mehta@gmail.com',
    password: process.env.USER_VIKAS_PASSWORD || 'password123'
  },
  {
    displayName: 'Uday',
    email: process.env.USER_UDAY_EMAIL || 'uday12@gmail.com',
    password: process.env.USER_UDAY_PASSWORD || '1234567'
  },
  {
    displayName: 'Aakhnsha shrivastav',
    email: process.env.USER_AKANKSHA_EMAIL || 'aakanshashrivastava12@gmail.com',
    password: process.env.USER_AKANKSHA_PASSWORD || '1wPKPZj44z'
  }
];

export function generateContactPayload() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const email = `${cleanFirst}.${cleanLast}${randomSuffix}@gmail.com`;

  const prefixes = ['98', '97', '96', '99', '88', '87', '70', '79', '63'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const remaining8 = Math.floor(10000000 + Math.random() * 90000000);
  const number = `+91 ${prefix}${remaining8}`;

  return {
    address_Type: 2,
    city_ID: 4827,
    contact_Person_Email: email,
    contact_Person_Name: name,
    contact_Person_Number: number,
    country_ID: 101,
    source_ID: 6,
    state_ID: 38
  };
}

async function postContactsForUser(reqContext: any, user: UserCreds, count = 5) {
  console.log(`\n======================================================`);
  console.log(`Authenticating: ${user.displayName} (${user.email})`);
  console.log(`======================================================`);

  let token = '';

  // 1. Attempt login as user
  const loginRes = await reqContext.post(`${API_BASE_URL}/api/user/login`, {
    data: { email: user.email, password: user.password }
  });

  if (loginRes.ok()) {
    const loginData = await loginRes.json();
    token = loginData.token;
    console.log(`Logged in successfully as ${user.displayName}. Token acquired.`);
  } else {
    console.warn(`User login failed for ${user.email} (Status ${loginRes.status()}). Falling back to Admin token...`);
    // Fallback: Login as admin
    const adminLoginRes = await reqContext.post(`${API_BASE_URL}/api/user/login`, {
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@rajasvidecor.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123'
      }
    });
    if (adminLoginRes.ok()) {
      const adminData = await adminLoginRes.json();
      token = adminData.token;
      console.log(`Acquired Admin token as fallback.`);
    } else {
      console.error(`Admin login fallback also failed! Cannot post contacts for ${user.displayName}`);
      return;
    }
  }

  // 2. Post 5 Contacts
  console.log(`Posting ${count} contacts for ${user.displayName}...`);
  for (let i = 1; i <= count; i++) {
    const payload = generateContactPayload();
    const res = await reqContext.post(`${API_BASE_URL}/api/Contact_Person`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    const status = res.status();
    let bodyText = '';
    try {
      bodyText = JSON.stringify(await res.json());
    } catch {
      bodyText = await res.text();
    }

    if (res.ok()) {
      console.log(`[Contact ${i}/${count}] SUCCESS (Status ${status}): ${payload.contact_Person_Name} | ${payload.contact_Person_Number} | ${payload.contact_Person_Email}`);
    } else {
      console.error(`[Contact ${i}/${count}] FAILED (Status ${status}): ${bodyText}`);
    }

    // Brief delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
}

async function main() {
  const reqContext = await request.newContext();
  console.log(`Starting bulk Contact_Person creation: 5 contacts per user across ${CRM_USERS.length} users.`);

  for (const user of CRM_USERS) {
    await postContactsForUser(reqContext, user, 5);
  }

  console.log(`\nAll users processed successfully!`);
  await reqContext.dispose();
}

if (require.main === module) {
  main().catch(console.error);
}
