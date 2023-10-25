import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";
// err is the class that we are extending

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // every custom error should be an instance of the CustomError class 
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  console.error(err);

  res.status(500).send({
    errors: [{ message: "Something went wrong" }],
  });
  
};