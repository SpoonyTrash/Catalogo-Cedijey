import "server-only";

import { GoogleSheetsProductRepository } from "../../repositories/google-sheets-product-repository";
import { InventoryService } from "../../services/inventory-service";

const productRepository = new GoogleSheetsProductRepository();

/**
 * Production composition root for inventory reads.
 *
 * Server Components should consume this service instead of constructing repositories directly.
 */
export const inventoryService = new InventoryService(productRepository);
