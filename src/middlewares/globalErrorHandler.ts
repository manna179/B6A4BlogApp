import { NextFunction, Request, Response } from "express";
import { error } from "node:console";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let errorMessage = "Internal server error";
  let errorDetails = err;

  // PrismaClientValidationError
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provided  incorrect field type or missing fields..";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "You provided  incorrect field type or missing fields..";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint error";
    }
  }else if(err instanceof Prisma.PrismaClientUnknownRequestError){
    statusCode = 500
    errorMessage = "error occurred during query execution"
  }else if(err instanceof Prisma.PrismaClientRustPanicError){
    statusCode = 500;
    errorMessage = " Engine crashed"
  }else if(err instanceof Prisma.PrismaClientInitializationError){
    if(err.errorCode = "P1000"){
      statusCode = 401;
      errorMessage = "Authentication failed. please check your credentials"
    }else if(err.errorCode === "P1001"){
      statusCode = 400;
      errorMessage = "Can't reach database server"
    }

  }

  res.status(statusCode);
  res.json({
    message: errorMessage,
    error: errorDetails,
  });
}

export default errorHandler;
