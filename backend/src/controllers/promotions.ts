import { Request, Response } from "express";
import { PromotionsRepository } from "../database/repositories/promotions"
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
dotenv.config(); 


/**
 * @description registers a new user
 * @route POST /api/signup
 * @access private
*/
export const insertsPromotionsToDb = async (req: Request, res: Response) => {
  const promotionsRepo = new PromotionsRepository();
  const promotions: any[] = [];
  const absolutePath = process.env.NODE_ENV === "development" ? '/Users/diegoleoro/monolith_insider_hood/backend/src/controllers/Deals&promotions.csv' : "/app/src/controllers/Deals&promotions.csv"
  // Create a read stream directly using the file name
  fs.createReadStream(absolutePath)
    .pipe(csv())
    .on('data', (data) => promotions.push(data))
    .on('end', async () => {
      try {
        const { insertedData } = await promotionsRepo.addNewRecords(promotions);
        res.status(201).json({ success: true, data: insertedData });
      } catch (error) {
        res.status(500).json({ success: false, error: error });
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ success: false, error: 'Failed to read CSV file' });
    });
};