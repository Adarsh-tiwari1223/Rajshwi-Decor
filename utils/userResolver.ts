import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface AppUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  aliases: string[];
}

export const KNOWN_USERS: AppUser[] = [
  {
    id: 20,
    name: 'Aakhnsha shrivastav',
    email: process.env.USER_AKANKSHA_EMAIL || 'aakanshashrivastava12@gmail.com',
    password: process.env.USER_AKANKSHA_PASSWORD || '1wPKPZj44z',
    aliases: ['akasnsha', 'akanksha', 'aakhnsha', 'akhnsha', 'aakansha', 'shrivastav', 'srivastav', 'aakanshashrivastava12', 'sales-akanksha']
  },
  {
    id: 3,
    name: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@rajasvidecor.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    aliases: ['admin', 'administrator', 'root']
  },
  {
    id: 5,
    name: 'Priya Patel',
    email: process.env.USER_PRIYA_EMAIL || 'priya.patel@gmail.com',
    password: process.env.USER_PRIYA_PASSWORD || 'password123',
    aliases: ['priya', 'priyapatel']
  },
  {
    id: 4,
    name: 'Rahul Sharma',
    email: process.env.USER_RAHUL_EMAIL || 'rahul.sharma@gmail.com',
    password: process.env.USER_RAHUL_PASSWORD || 'password123',
    aliases: ['rahul', 'rahulsharma']
  },
  {
    id: 6,
    name: 'Amit Verma',
    email: process.env.USER_AMIT_EMAIL || 'amit.verma@gmail.com',
    password: process.env.USER_AMIT_PASSWORD || 'password123',
    aliases: ['amit', 'amitverma']
  },
  {
    id: 7,
    name: 'Sneha Joshi',
    email: process.env.USER_SNEHA_EMAIL || 'sneha.joshi@gmail.com',
    password: process.env.USER_SNEHA_PASSWORD || 'password123',
    aliases: ['sneha', 'snehajoshi']
  },
  {
    id: 8,
    name: 'Vikas Mehta',
    email: process.env.USER_VIKAS_EMAIL || 'vikas.mehta@gmail.com',
    password: process.env.USER_VIKAS_PASSWORD || 'password123',
    aliases: ['vikas', 'vikasmehta']
  },
  {
    id: 9,
    name: 'Uday Singh',
    email: process.env.USER_UDAY_EMAIL || 'uday12@gmail.com',
    password: process.env.USER_UDAY_PASSWORD || '1234567',
    aliases: ['uday', 'udaysingh']
  },
  {
    id: 19,
    name: 'Anjali Sharma',
    email: 'anjali@rajasvidecor.com',
    password: 'Anjali@220011',
    aliases: ['anjali', 'anjalisharma']
  },
  {
    id: 18,
    name: 'Kripa Shankar',
    email: 'Kripa@rajasvidecor.com',
    password: 'Kripa@12100',
    aliases: ['kripa', 'kripashankar']
  },
  {
    id: 17,
    name: 'Gaurav',
    email: 'gaurav@rajasvidecor.com',
    password: 'Gaurav@1210',
    aliases: ['gaurav']
  },
  {
    id: 16,
    name: 'Kashish',
    email: 'kashish@rajasvidecor.com',
    password: 'Kashish@202612',
    aliases: ['kashish']
  },
  {
    id: 15,
    name: 'Tannu',
    email: 'tannu@rajasvidecor.com',
    password: 'Tannu@120012',
    aliases: ['tannu']
  },
  {
    id: 14,
    name: 'Vanya',
    email: 'vanya@rajasvidecor.com',
    password: 'Vanya@12345678',
    aliases: ['vanya']
  },
  {
    id: 13,
    name: 'Aakansha',
    email: 'aakansha@rajasvidecor.com',
    password: 'Rajasvi@2024',
    aliases: ['aakansha-crm', 'aakansha13']
  },
  {
    id: 12,
    name: 'Neetu',
    email: 'neetu@rajasvidecor.com',
    password: 'Rajasvi@1234567',
    aliases: ['neetu']
  },
  {
    id: 11,
    name: 'Tanisha',
    email: 'tanisha@rajasvidecor.com',
    password: 'Rajasvi@2026',
    aliases: ['tanisha']
  }
];

/**
 * Extract user keyword from CLI arguments if passed via -k or --user or -g
 */
export function extractUserKeywordFromCli(): string | null {
  const args = process.argv;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-k' || arg === '--user' || arg === '-u') {
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        return args[i + 1];
      }
    } else if (arg.startsWith('-k=') || arg.startsWith('--user=')) {
      return arg.split('=')[1];
    }
  }

  // Check -g or --grep for user names
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-g' || arg === '--grep') {
      const grepVal = args[i + 1] || '';
      for (const u of KNOWN_USERS) {
        for (const alias of u.aliases) {
          if (grepVal.toLowerCase().includes(alias)) {
            return alias;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Resolve user by keyword, environment variable, or CLI flag.
 * Default fallback is 'Aakhnsha shrivastav' if keyword suggests akanksha/akasnsha,
 * or 'Admin' by default.
 */
export function resolveUser(targetIdentifier?: string): AppUser {
  const query = (
    targetIdentifier ||
    process.env.TARGET_USER ||
    process.env.TEST_USER ||
    extractUserKeywordFromCli() ||
    'Admin'
  ).trim().toLowerCase();

  const cleanQuery = query.replace(/[^a-z0-9]/g, '');

  // 1. Direct match on aliases, name, or email
  for (const user of KNOWN_USERS) {
    if (user.aliases.some(alias => alias.toLowerCase() === query || alias.replace(/[^a-z0-9]/g, '') === cleanQuery)) {
      return user;
    }
    if (user.name.toLowerCase() === query || user.email.toLowerCase() === query) {
      return user;
    }
  }

  // 2. Substring / Fuzzy match
  for (const user of KNOWN_USERS) {
    if (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.aliases.some(alias => query.includes(alias) || alias.includes(query))
    ) {
      return user;
    }
  }

  // 3. Specific tolerance for variations of Akanksha / Akasnsha
  if (/ak[a-z]*sh/i.test(query) || query.includes('shriv') || query.includes('sriv')) {
    return KNOWN_USERS[0]; // Aakhnsha shrivastav
  }

  // Fallback to Admin
  return KNOWN_USERS[1];
}
