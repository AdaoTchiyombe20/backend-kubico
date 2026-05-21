import type {Request, Response, NextFunction} from 'express';
import { NegociationEventDto, type NegociationEventDtoType } from '../dto/negociationEvent.dto.js';

export const negociationEventController = {
    async initNegociationEvent(req: Request, res: Response, next: NextFunction) {
        try{ 
            const data: NegociationEventDtoType = NegociationEventDto.parse(req.body);
            const { property_id, offer_price } = data
            
        }catch(err){
            next(err);
        }
    }

}