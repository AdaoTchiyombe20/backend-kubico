import z from "zod";
import { PropertyStatus, TypeProperties, CompartmentsTypes, Property_purchase } from "@prisma/client";

const compartmentSchema = z.object({
  type: z.string().transform(v => v.toUpperCase()).pipe(    
    z.nativeEnum(CompartmentsTypes, { message: "Tipo de cômodo inválido" })
  ),
  quantity: z.number().int().positive("A quantidade deve ser um valor positivo"),
});

export const createPropertySchema = z.object({
  title:            z.string().min(1, "O título é obrigatório"),
  description:      z.string().min(1, "A descrição é obrigatória"),
  address_info:     z.string().min(1, "A informação do endereço é obrigatória"),
  neighborhood:     z.string().min(1, "O bairro é obrigatório"),
  municipality:     z.string().min(1, "O município é obrigatório"),
  price:             z.string()
                       .transform(val => Number(val)) 
                       .pipe(
                         z.number()
                          .int("O preço deve ser um número inteiro")
                          .positive("O preço deve ser um valor positivo")
                       ),
  is_negotiable:  z.boolean().default(false),
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
  description:      z.string().min(1, "A descrição é obrigatória").optional(),
  address_info:     z.string().min(1, "A informação do endereço é obrigatória").optional(),
  neighborhood:     z.string().min(1, "O bairro é obrigatório").optional(),
  municipality:     z.string().min(1, "O município é obrigatório").optional(),
  price:             z.string()
                       .transform(val => Number(val)) 
                       .pipe(
                         z.number()
                          .int("O preço deve ser um número inteiro")
                          .positive("O preço deve ser um valor positivo")
                       ).optional(),
  is_negotiable:  z.boolean().optional(),
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
})

export type CreatePropertyDTO = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInfoDTO = z.infer<typeof  updatePropertyInfo>
