import { Request, Response } from "express";
import { NewsletterRepository } from "../database/repositories/newsletter";

/**
 * @description send newsletter
 * @route POST /api/newsletter/send 
 * @access public
*/
export const sendNewsLetter = async (req: Request, res: Response) => {
  const newsletterRepository = new NewsletterRepository();
  const { frequency } = req.body;
  const { message } = await newsletterRepository.sendNewsLetter({ frequency })
  res.status(200).send(message);
}

/**
 * @description send newsletter
 * @route POST /api/newsletter/newsletterreferral 
 * @access public
*/
export const sendNewsLetterReferralEmail = async (req: Request, res: Response) => {
  const newsletterRepository = new NewsletterRepository();
  const { email } = req.body;
  const templateId = 'd-86a14d2fac464094bcbd50099363aefe';
  const { message , statusCode} = await newsletterRepository.sendReferralEmail({ email, templateId })
  res.status(statusCode).send(message);
}
