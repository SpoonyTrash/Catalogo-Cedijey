import "server-only";

import type { ProductRepository } from "@/repositories/product-repository";
import type { Product } from "@/types/product";

export class InMemoryProductRepository implements ProductRepository {
    private readonly products: readonly Product[];

    constructor(products: readonly Product[]) {
        this.products = [...products];
    }

    getAll(): Promise<readonly Product[]> {
        return Promise.resolve([...this.products]);
    }
}
