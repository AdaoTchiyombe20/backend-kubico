import type { Request, Response, NextFunction } from "express";
import {
  type CreateIndividualOwnerDTO,
  type CreateOwnerCompanyDTO,
  createOwnerCompanyComplete,
  createIndividualOwner,
} from "../dto/profile.dto.js";
import { profileService } from "../services/profile.services.js";
import { convertBRDateToISO } from "../utils/dateConverter.utils.js";

type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;

export const profileController = {
  createOwnerIndividual: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.accessUser!.profileId;
      const data: CreateIndividualOwnerDTO = createIndividualOwner.parse(req.body);
     //full_name, birth_date, phone, bi, nif, bank_account 
      await profileService.createOwnerIndividual(Number(id), {
        full_name: data.ownerName,
        birth_date:convertBRDateToISO(data.dateOfBirth),
        phone: data.phone,
        bi: data.bi,
        bank_account: data.bankAccount,
      });

      res.status(201).json({ message: "Proprietário cadastrado! Aguarde a verificação dos dados." });
    } catch (error) {
      next(error);
    }
  },

  createOwnerCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.accessUser!.profileId;
      const data: CreateOwnerCompanyDTO = createOwnerCompanyComplete.parse(req.body);

      await profileService.createOwnerCompany(Number(id), {
        legal_name: data.nameOfCompany,
        phone: data.phone,
        nif: data.nif,
        bank_account: data.bankAccount,
      });

      res.status(201).json({ message: "Proprietário cadastrado! Aguarde a verificação dos dados." });
    } catch (error) {
      next(error);
    }
  },
};
