import { Request, Response } from "express";
import { PromotionsRepository } from "../database/repositories/promotions"
import { ChatNotifications } from "../database/repositories/chat"
import { sendEmailNotifications } from "../services/emailNotifications"

import dotenv from 'dotenv';
dotenv.config();


/**
 * @description sends notification email
 * @route POST /api/signup
 * @access private
*/
export const SendChatNotifications = async (req: Request, res: Response) => {
  const { webPageRoute, payLoad } = req.body;
  const emailNotify = new sendEmailNotifications(webPageRoute, process.env.Email ? process.env.Email : '');



  emailNotify.sendEmail(JSON.stringify(payLoad))
    .then(result => console.log('Email sending initiated', result))
    .catch(error => console.error('Error sending email', error));
  res.status(202).json({ message: 'Notification process initiated' });
}