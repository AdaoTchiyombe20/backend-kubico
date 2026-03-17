import type { Request, Response, NextFunction } from "express";
import {
  type CreateClientCompanyDTO,
  type CreateIndividualClientDTO,
  type CreateIndividualOwnerDTO,
  type CreateOwnerCompanyDTO,
  createClientCompanyComplete,
  createIndividualClient,
  createOwnerCompanyComplete,
  createIndividualOwner,
} from "../dto/profile.dto.js";
import { profileService } from "../services/profile.services.js";

type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;

export const profileController = {
  createClientIndividual: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user!.sub;
      const files = req.files as MulterFiles;
      const data: CreateIndividualClientDTO = createIndividualClient.parse(req.body);

      await profileService.createClientIndividual(Number(id), {
        full_name: data.fullName ?? "",
        birth_date: data.dateOfBirth,
        phone: data.phone ?? "",
        bi: data.bi ?? "",
      }, files);

      res.status(201).json({ message: "Cliente cadastrado! Aguarde a verificação dos dados." });
    } catch (error) {
      next(error);
    }
  },

  createClientCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user!.sub;
      const files = req.files as MulterFiles;
      const data: CreateClientCompanyDTO = createClientCompanyComplete.parse(req.body);

      await profileService.createClientCompany(Number(id), {
        legal_name: data.nameOfCompany ?? "",
        phone: data.phone ?? "",
        nif: data.nif ?? "",
        nameOfLegalRepresentative: data.nameOfLegalRepresentative ?? "",
      }, files);

      res.status(201).json({ message: "Cliente cadastrado! Aguarde a verificação dos dados." });
    } catch (error) {
      next(error);
    }
  },

  createOwnerIndividual: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user!.sub;
      const files = req.files as MulterFiles;
      const data: CreateIndividualOwnerDTO = createIndividualOwner.parse(req.body);

      await profileService.createOwnerIndividual(Number(id), {
        full_name: data.ownerName ?? "",
        birth_date:new Date(data.dateOfBirth ?? ""),
        phone: data.phone ?? "",
        bi: data.bi ?? "",
        nif: data.nif ?? "",
        bank_account: data.bankAccount ?? "",
      }, files);

      res.status(201).json({ message: "Proprietário cadastrado! Aguarde a verificação dos dados." });
    } catch (error) {
      next(error);
    }
  },

  createOwnerCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user!.sub;
      const files = req.files as MulterFiles;
      const data: CreateOwnerCompanyDTO = createOwnerCompanyComplete.parse(req.body);

      await profileService.createOwnerCompany(Number(id), {
        legal_name: data.nameOfCompany ?? "",
        phone: data.phone ?? "",
        nif: data.nif ?? "",
        nameOfLegalRepresentative: data.nameOfLegalRepresentative ?? "",
        bank_account: data.bankAccount ?? "",
      }, files);

      res.status(201).json({ message: "Proprietário cadastrado! Aguarde a verificação dos dados." });
    } catch (error) {
      next(error);
    }
  },
};