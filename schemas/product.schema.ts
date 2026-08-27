import { z } from "zod";

function requiredText(fieldName: string) {
    return z
        .string({ error: `${fieldName} debe ser texto.` })
        .min(1, { error: `${fieldName} es obligatorio.` })
        .refine((value) => value.trim().length > 0, {
            error: `${fieldName} no puede contener únicamente espacios.`,
        })
        .refine((value) => value === value.trim(), {
            error: `${fieldName} no debe comenzar ni terminar con espacios.`,
        });
}

export const productSchema = z.strictObject({
    sku: requiredText("SKU"),
    artist: requiredText("ARTISTA"),
    album: requiredText("ALBUM"),
    status: requiredText("ESTADO"),
    genre: requiredText("GENERO"),
    coverImageUrl: z.httpUrl({ error: "PORTADA debe ser una URL HTTP o HTTPS válida." }).nullable(),
});

export type Product = Readonly<z.infer<typeof productSchema>>;
