import { faker } from '@faker-js/faker';

export interface MasterItemData {
  category: string;
  itemName: string;
  itemCode: string;
  brandOrSource: string;
  unit: string;
  unitPrice: string;
  description: string;
}

const REAL_MASTER_ITEMS = [
  {
    category: 'Plywood & Boards',
    itemName: 'BWP Marine Grade Plywood 18mm',
    itemCode: 'MAT-PLY-18M',
    brandOrSource: 'Greenply Club Premier',
    unit: 'Sq. Ft.',
    unitPrice: '₹145/sq.ft',
    description: 'Boiling water proof calibrated ply with 100% hardwood core'
  },
  {
    category: 'Veneers & Laminates',
    itemName: 'Smoked Oak Natural Wood Veneer 4mm',
    itemCode: 'MAT-VEN-SMK',
    brandOrSource: 'CenturyVeneers',
    unit: 'Sheet (8x4)',
    unitPrice: '₹3,200/sheet',
    description: 'Exotic architectural grade natural wood veneer sheet with fleece backing'
  },
  {
    category: 'Hardware & Fittings',
    itemName: 'Soft-Close Concealed Drawer Runner (Tandem Box)',
    itemCode: 'HDW-DRW-500',
    brandOrSource: 'Hettich Quadro 4D',
    unit: 'Pair',
    unitPrice: '₹2,850/pair',
    description: 'Full extension synchronous soft-closing slide with 30kg load rating'
  },
  {
    category: 'Fabrics & Soft Furnishing',
    itemName: 'High-GSM Blackout Velvet Curtain Fabric',
    itemCode: 'FAB-VLV-BLK',
    brandOrSource: 'D Decor Signature',
    unit: 'Meter',
    unitPrice: '₹1,650/meter',
    description: '100% light-blocking textured luxury velvet fabric with acoustic dampening'
  },
  {
    category: 'Wall Finishes & Paints',
    itemName: 'Royale Luxury Acrylic Emulsion Teflon Finish',
    itemCode: 'PNT-RYL-ASP',
    brandOrSource: 'Asian Paints Royale',
    unit: 'Liter (20L Drum)',
    unitPrice: '₹8,400/drum',
    description: 'Ultra-low VOC anti-fungal luxury interior paint with Teflon surface protector'
  },
  {
    category: 'Lead Sources',
    itemName: 'Showroom Walk-in Visit',
    itemCode: 'SRC-WLK-DIR',
    brandOrSource: 'Flagship Showroom Desk',
    unit: 'Channel',
    unitPrice: 'N/A',
    description: 'Direct prospective customer walking in to view model kitchen and bedroom displays'
  },
  {
    category: 'Lead Sources',
    itemName: 'Architect & Interior Designer Referral',
    itemCode: 'SRC-ARC-REF',
    brandOrSource: 'Partner Network Program',
    unit: 'Channel',
    unitPrice: 'N/A',
    description: 'Qualified referral from empaneled architecture and consulting firms'
  },
  {
    category: 'Lead Sources',
    itemName: 'Instagram Reel & Meta Sponsored Campaign',
    itemCode: 'SRC-SCL-DIG',
    brandOrSource: 'Digital Performance Marketing',
    unit: 'Channel',
    unitPrice: 'N/A',
    description: 'Inbound customer lead generated via Instagram video showcase and sponsored ad'
  }
];

export class MastersDataGenerator {
  static generate(overrides: Partial<MasterItemData> = {}): MasterItemData {
    const item = faker.helpers.arrayElement(REAL_MASTER_ITEMS);
    return {
      category: item.category,
      itemName: item.itemName,
      itemCode: item.itemCode,
      brandOrSource: item.brandOrSource,
      unit: item.unit,
      unitPrice: item.unitPrice,
      description: item.description,
      ...overrides
    };
  }
}
