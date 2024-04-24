import { Request, Response } from "express";
import { NewsletterRepository } from "../database/repositories/newsletter";
import { Document } from 'mongodb';
/**
 * @description send newsletter
 * @route POST /api/newsletter/send 
 * @access public
*/
export const sendNewsLetter = async (req: Request, res: Response) => {
  const newsletterRepository = new NewsletterRepository();
  const { message } = await newsletterRepository.sendNewsLetter()
  res.status(200).send(message);
}

/**
 * @description send newsletter
 * @route PUT /api/newsletter/udpate
 * @access public
*/
export const udpateNewsletterUsers = async (req: Request, res: Response) => {

  console.log("reqq", req.body)

  const { identifier , updates } = req.body;
  const newsletterRepository = new NewsletterRepository();
  const { message, statusCode } = await newsletterRepository.updateUsers({identifier, updates});
  res.status(statusCode).send(message);
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
  const { message, statusCode } = await newsletterRepository.sendReferralEmail({ email, templateId })
  res.status(statusCode).send(message);
}

/**
 * @description send newsletter
 * @route GET /api/newsletter/getuserinfo 
 * @access public
*/
export const getuserInfo = async(req:Request, res:Response)=>{
  const newsletterRepository = new NewsletterRepository();
  const { identifier } = req.params;
  const {  statusCode , user} = await newsletterRepository.getUserInfo({ identifier })
  res.status(statusCode).send(user);
}