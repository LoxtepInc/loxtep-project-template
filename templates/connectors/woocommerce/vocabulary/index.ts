/**
 * WooCommerce Vocabulary Entries (Canonical Source)
 *
 * Community-contributable vocabulary data for WooCommerce connector entities:
 * orders, products, customers.
 *
 * This file is the canonical source of truth for WooCommerce vocabulary data.
 * The runtime logic (types, registry, lookup) lives in platform-backend.
 *
 * Shape: Each entry conforms to the VocabularyEntry interface defined in
 * ../../vocabulary-types.ts
 */

import type { VocabularyEntry } from '../../vocabulary-types';
import { woocommerceOrders } from './orders';
import { woocommerceProducts } from './products';
import { woocommerceCustomers } from './customers';

/** All WooCommerce vocabulary entries (community-contributable data) */
export const WOOCOMMERCE_ENTRIES: VocabularyEntry[] = [
  woocommerceOrders,
  woocommerceProducts,
  woocommerceCustomers,
];

export { woocommerceOrders } from './orders';
export { woocommerceProducts } from './products';
export { woocommerceCustomers } from './customers';
