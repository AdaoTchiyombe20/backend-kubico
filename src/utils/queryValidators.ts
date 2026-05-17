import { AppError } from "../errors/App.Errors.js";

export class QueryValidator {
  static ensureSingleString(param: any, fieldName: string): string | undefined {
    if (Array.isArray(param)) {
      throw new AppError(
        `${fieldName} deve ser uma string única, não um array`,
        400
      );
    }
    if (typeof param !== 'string' && param !== undefined) {
      throw new AppError(`${fieldName} deve ser uma string`, 400);
    }
    return param as string | undefined;
  }

  static ensurePositiveNumber(param: any, fieldName: string): number | undefined {
    if (Array.isArray(param)) {
      throw new AppError(
        `${fieldName} deve ser um número único, não um array`,
        400
      );
    }
    if (param === undefined) return undefined;
    
    const num = Number(param);
    if (isNaN(num)) {
      throw new AppError(`${fieldName} deve ser um número válido`, 400);
    }
    if (num < 0) {
      throw new AppError(`${fieldName} deve ser um número positivo`, 400);
    }
    return num;
  }
}
