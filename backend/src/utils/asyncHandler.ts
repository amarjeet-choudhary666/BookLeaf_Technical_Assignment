import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (requestHandler: AsyncHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction)  => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    }
}
