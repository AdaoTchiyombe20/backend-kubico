import z from "zod";
import { PropertyStatus, TypeProperties, CompartmentsTypes, Property_purchase } from "@prisma/client";

const compartmentSchema = z.object({
  type: z.string().transform(v => v.toUpperCase()).pipe(    
    z.nativeEnum(CompartmentsTypes, { message: "Tipo de cômodo inválido" })
  ),
  quantity: z.number().int().positive("A quantidade deve ser um valor positivo"),
});


export const rawSearchFiltersSchema = z.object({
  type_purchase: z.string().optional(),
  type_of_property: z.string().optional(),
  neighborhood: z.string().optional(),
  municipality: z.string().optional(),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
  is_negotiable: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const normalized = val.toLowerCase();

        if (normalized === "true") return true;
        if (normalized === "false") return false;
      }

      return val;
    },
    z.boolean().optional()
  ),
});

export const parsedSearchFiltersSchema = z.object({
  type_purchase: z.nativeEnum(Property_purchase).optional(),
  type_of_property: z.nativeEnum(TypeProperties).optional(),
  neighborhood: z.string().optional(),
  municipality: z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  is_negotiable: z.boolean().optional(),
});


export const createPropertySchema = z.object({
  title:            z.string().min(1, "O título é obrigatório"),
  description:      z.string().min(1, "A descrição é obrigatória").max(2000, "A descrição não pode exceder 2000 caracteres"),
  address_info:     z.string().min(1, "A informação do endereço é obrigatória"),
  neighborhood:     z.string().min(1, "O bairro é obrigatório"),
  municipality:     z.string().min(1, "O município é obrigatório"),
  price:             z.string()
                       .transform(val => Number(val)) 
                       .pipe(
                          z.number()
                            .int("O preço deve ser um número inteiro")
                            .positive("O preço deve ser um valor positivo")
                            .max(2_147_483_647, "O preço não pode ultrapassar o limite de inteiro")
                        ),
  is_negotiable: z.preprocess(
                      (val) => {
                        if (typeof val === "string") {
                          return val.toLowerCase() === "true";
                        }
                        return val;
                      },
                      z.boolean().default(false)
                    ),
  type_purchase:   z.string().transform(v => v.toUpperCase()).pipe(
                      z.nativeEnum(Property_purchase, { message: "Tipo de compra inválido" })
                    ),
  type_of_property: z.string().transform(v => v.toUpperCase()).pipe(
                      z.nativeEnum(TypeProperties, { message: "Tipo de propriedade inválido" })
                    ),
  compartments:     z.string()
                       .transform(val => {
                         try {
                           return JSON.parse(val);
                         } catch {
                           throw new Error("Formato inválido para compartments. Deve ser JSON válido.");
                         }
                       })
                       .pipe(z.array(compartmentSchema).min(1, "Pelo menos um cômodo é obrigatório")),
  total_area:       z.string()
                       .transform(val => Number(val))
                       .pipe(
                         z.number()
                          .positive("A área total deve ser um valor positivo")
                       ).optional(),
  latitude:         z.string()
                        .transform(val => Number(val))
                        .pipe(
                          z.number()
                        ).optional(),
  longitude:        z.string()
                         .transform(val => Number(val))
                         .pipe(
                           z.number()
                         ).optional(),
});
export const updatePropertyInfo = z.object({
  title:            z.string().min(1, "O título é obrigatório").optional(),
  description:      z.string().min(1, "A descrição é obrigatória").max(2000, "A descrição não pode exceder 2000 caracteres").optional(),
  address_info:     z.string().min(1, "A informação do endereço é obrigatória").optional(),
  neighborhood:     z.string().min(1, "O bairro é obrigatório").optional(),
  municipality:     z.string().min(1, "O município é obrigatório").optional(),
  price:             z.string()
                       .transform(val => Number(val)) 
                       .pipe(
                          z.number()
                            .int("O preço deve ser um número inteiro")
                            .positive("O preço deve ser um valor positivo")
                            .max(2_147_483_647, "O preço não pode ultrapassar o limite de inteiro")
                        ).optional(),
  is_negotiable:  z.preprocess(
      (val) => {
        if (typeof val === "string") {
          return val.toLowerCase() === "true";
        }
        return val;
      },
      z.boolean().default(false)
    ).optional(),
  type_purchase:   z.string().transform(v => v.toUpperCase()).pipe(
                      z.nativeEnum(Property_purchase, { message: "Tipo de compra inválido" })
                    ).optional(),
  type_of_property: z.string().transform(v => v.toUpperCase()).pipe(
                      z.nativeEnum(TypeProperties, { message: "Tipo de propriedade inválido" })
                    ).optional(),
  compartments:     z.string()
                       .transform(val => {
                         try {
                           return JSON.parse(val);
                         } catch {
                           throw new Error("Formato inválido para compartments. Deve ser JSON válido.");
                         }
                       })
                       .pipe(z.array(compartmentSchema).min(1, "Pelo menos um cômodo é obrigatório")).optional(),
  total_area:       z.string()
                       .transform(val => Number(val))
                       .pipe(
                         z.number()
                          .positive("A área total deve ser um valor positivo")
                       ).optional(),
  latitude:         z.string()
                        .transform(val => Number(val))
                        .pipe(
                          z.number()
                        ).optional(),
  longitude:        z.string()
                         .transform(val => Number(val))
                         .pipe(
                           z.number()
                         ).optional(),
})

export type CreatePropertyDTO = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInfoDTO = z.infer<typeof updatePropertyInfo>;
export type RawSearchFilters = z.infer<typeof rawSearchFiltersSchema>;
export type ParsedSearchFilters = z.infer<typeof parsedSearchFiltersSchema>;
