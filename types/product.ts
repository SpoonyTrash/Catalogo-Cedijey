export type Product = Readonly<{
    sku: string;
    artist: string;
    album: string;
    status: string;
    genre: string;
    coverImageUrl: string | null;
}>;
