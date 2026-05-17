export class AppError extends Error {
    public readonly statusCode!: number;

    constructor(message:string, statusCode:number = 400){
        super(message)
        Object.setPrototypeOf(this, AppError.prototype);
        this.statusCode = statusCode
        this.name = "AppError"
    }
}
