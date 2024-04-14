import { Request, Response } from "express";
import { NewsletterRepository } from "../database/repositories/newsletter";

/**
 * @description send newsletter
 * @route GET /api/newsletter/send 
 * @access public
*/
export const sendNewsLetter = async (req: Request, res: Response) => {
  
  const newsletterRepository = new NewsletterRepository();
  console.log("req.body", req.body)
  const { frequency } = req.body;

  const {message}= await newsletterRepository.sendNewsLetter({frequency})
  res.status(200).send(message);

}

