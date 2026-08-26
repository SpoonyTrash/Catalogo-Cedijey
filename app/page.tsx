import { ProductGrid } from "@/components/inventory/product-grid";
import { InMemoryProductRepository } from "@/repositories/in-memory-product-repository";
import type { ProductRepository } from "@/repositories/product-repository";
import { InventoryService } from "@/services/inventory-service";
import type { Product } from "@/types/product";

const previewProducts: readonly Product[] = [
    {
        sku: "5SOS-STAR",
        artist: "5 Seconds Of Summer",
        album: "Everyone's A Star!",
        status: "Poco stock",
        genre: "Pop rock",
        coverImageUrl: null,
    },
    {
        sku: "ACDC-HELL",
        artist: "AC DC",
        album: "Highway To Hell",
        status: "Poco stock",
        genre: "Rock",
        coverImageUrl: null,
    },
    {
        sku: "AF-2M",
        artist: "Alejandro Fernández",
        album: "Dos Mundos",
        status: "Agotado",
        genre: "Regional mexicano",
        coverImageUrl: null,
    },
];

const productRepository: ProductRepository = new InMemoryProductRepository(previewProducts);

const inventoryService = new InventoryService(productRepository);

export default async function HomePage() {
    const products = await inventoryService.getProducts();

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8">
                    <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                        Verificación de tipos
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-950">
                        Inventario de llaveros
                    </h1>
                </header>

                <ProductGrid products={products} />
            </div>
        </main>
    );
}
