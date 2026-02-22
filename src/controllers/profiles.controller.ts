import type { Request, Response, NextFunction } from "express";import {type CreateClientCompanyDTO, type CreateIndividualClientDTO, type CreateIndividualOwnerDTO , type CreateOwnerCompanyDTO, createClientCompanyComplete, createIndividualClient, createOwnerCompanyComplete, createIndividualOwner
} from "../dto/profile.dto.js";
import { profileService } from "../services/profile.services.js";

export const profileController = {
  createClientCompany: async(req: Request,res: Response, next : NextFunction) => {
    try{
      const id= req.user!.sub

      const data: CreateClientCompanyDTO = createClientCompanyComplete.parse(req.body);

      const {nameOfCompany, phone, nif, nameOfLegalRepresentative, biOfLegalRepresentative, commercialCertificate, docOfLegalRepresentativeFromCompany} = data

      const client = await profileService.createClientCompany(
        Number(id),
        {
          legal_name: nameOfCompany?? '',
          phone: phone ?? '',
          nif: nif?? '', 
          nameOfLegalRepresentative: nameOfLegalRepresentative?? '' 
        }, 
        [
          {
            type: "CERTIDAO_COMERCIAL",
            url: commercialCertificate?? ''
           },
          {
            type: "BI_REPRESENTANTE",
            url: biOfLegalRepresentative?? ''
          }, 
          {
            type:"DOC_COMPROVANTE_REPRESENTANTE_LEGAL_EMPRESA",
            url: docOfLegalRepresentativeFromCompany?? ''
          }
          ]);

      res.status(201).json({
        message: 'Cliente cadastrado! Aguarde a verificação dos dados.',
        client
      })
      
    }catch(error){
      next(error)
    }
  },
  createClientIndividual: async(req: Request,res: Response, next : NextFunction) => {
    try{
      const id= req.user!.sub

      const data: CreateIndividualClientDTO = createIndividualClient.parse(req.body);
      const {bi, biFrontAndBack, dateOfBirth, fullName, phone, selfieWithBi} = data


      const client = await profileService.createClientIndividual(
        Number(id), 
        {
          full_name: fullName?? '',
          birth_date: dateOfBirth,
          phone: phone?? ''  
        }, 
        [
          {
            type: 'BI', 
            url: biFrontAndBack, 
            document_number: bi
          },
          {
            type: 'SELFIE_WITH_BI',
            url: selfieWithBi
          }
        ]);

      res.status(201).json({
        message: 'Cliente cadastrado! Aguarde a verificação dos dados.',
        client
      })
      
    }catch(error){
      next(error)
    }
  },
  createOwnerCompany: async(req: Request,res: Response, next : NextFunction) => {
    try{
      const id= req.user!.sub
      const data: CreateOwnerCompanyDTO = createOwnerCompanyComplete.parse(req.body);
      const {bankAccount,bankAccountProof,biOfLegalRepresentative,commercialCertificate, docOfLegalRepresentativeFromCompany, nameOfCompany, nameOfLegalRepresentative, nif, phone} = data

      const owner = await profileService.createOwnerCompany(
      Number(id),
      {
        legal_name: nameOfCompany?? '',
        phone: phone?? '',
        nif: nif??'',
        nameOfLegalRepresentative: nameOfLegalRepresentative??'',
        bank_account: bankAccount
      },
      [
        {
          type:'COMPROVATIVO_TITULARIDADE_CONTA_BANCARIA',
          url: bankAccountProof,
          document_number: bankAccount
        }, 
        {
          type: 'BI_REPRESENTANTE',
          url: biOfLegalRepresentative?? ''
        },
        {
          type: 'CERTIDAO_COMERCIAL',
          url: commercialCertificate?? ''
        },
        {
          type: 'DOC_COMPROVANTE_REPRESENTANTE_LEGAL_EMPRESA',
          url: docOfLegalRepresentativeFromCompany?? ''
        }
      ]  
    );

      res.status(201).json({
        message: 'Proprietario cadastrado! Aguarde a verificação dos dados.',
        owner
      })
      
    }catch(error){
      next(error)
    }
  },
  createOwnerIndividual: async(req: Request,res: Response, next : NextFunction) => {
    try{
      const id= req.user!.sub
      const data: CreateIndividualOwnerDTO = createIndividualOwner.parse(req.body);
      const {bankAccountProof,bi,nif,phone, dateOfBirth, ownerName, bankAccount} = data

      const owner = await profileService.createOwnerIndividual(Number(id), {
        full_name: ownerName?? '',
        birth_date: dateOfBirth?? '',
        phone: phone??'',
      },
      [
        {
          type: 'COMPROVATIVO_TITULARIDADE_CONTA_BANCARIA',
          url: bankAccountProof,
          document_number: bankAccount??''
        },
        {
            type:"BI",
            document_number: bi??''
        },
        {
            type:"NIF",
            document_number: nif??''
        }
      ]
    );

      res.status(201).json({
        message: 'Proprietario cadastrado! Aguarde a verificação dos dados.',
        owner
      })
      
    }catch(error){
      next(error)
    }
  },
}
