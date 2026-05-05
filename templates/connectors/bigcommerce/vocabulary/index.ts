/**
 * BigCommerce Vocabulary Entries (Canonical Source)
 *
 * Community-contributable vocabulary data for BigCommerce connector entities:
 * orders, products, customers.
 *
 * This file is the canonical source of truth for BigCommerce vocabulary data.
 * The runtime logic (types, registry, lookup) lives in platform-backend.
 *
 * Shape: Each entry conforms to the VocabularyEntry interface defined in
 * ../../vocabulary-types.ts
 */

import type { VocabularyEntry } from '../../vocabulary-types';
import { bigcommerceOrders } from './orders';
import { bigcommerceProducts } from './products';
import { bigcommerceCustomers } from './customers';

/** All BigCommerce vocabulary entries (community-contributable data) */
export const BIGCOMMERCE_ENTRIES: VocabularyEntry[] = [
  bigcommerceOrders,
  bigcommerceProducts,
  bigcommerceCustomers,
];

export { bigcommerceOrders } from './orders';
export { bigcommerceProducts } from './products';
export { bigcommerceCustomers } from './customers';
