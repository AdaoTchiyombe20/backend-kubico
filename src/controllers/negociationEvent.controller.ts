import type {Request, Response, NextFunction} from 'express';
import { NegociationEventDto, type NegociationEventDtoType } from '../dto/negociationEvent.dto.js';
import { negociationEventService } from '../services/negociationEvent.services.js';

export const negociationEventController = {
    async initNegociationEvent(req: Request, res: Response, next: NextFunction) {
        try{ 
            const profile_id = Number(req.accessUser?.profileId);
            const data: NegociationEventDtoType = NegociationEventDto.parse(req.body);
            
            if(!profile_id) throw new Error("Perfil não encontrado!");
            if(isNaN(profile_id)) throw new Error("ID do perfil inválido!");

            const result = await negociationEventService.initNegociationEvent(profile_id, data)

            res.json({
                success: true,
                message: "Evento de negociação iniciado com sucesso!",
                data: result
            })
               
        }catch(err){
            next(err);
        }
    }

}