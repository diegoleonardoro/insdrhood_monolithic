"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertsPromotionsToDb = void 0;
const promotions_1 = require("../database/repositories/promotions");
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * @description registers a new user
 * @route POST /api/signup
 * @access private
*/
const insertsPromotionsToDb = async (req, res) => {
    const promotionsRepo = new promotions_1.PromotionsRepository();
    const promotions = [];
    // const absolutePath =  '/Users/diegoleoro/monolith_insider_hood/backend/src/controllers/Deals&promotions.csv'
    const absolutePath = process.env.NODE_ENV === "development" ? '/Users/diegoleoro/monolith_insider_hood/backend/src/controllers/Deals&promotions.csv' : "/app/src/controllers/Deals&promotions.csv";
    // Create a read stream directly using the file name
    fs_1.default.createReadStream(absolutePath)
        .pipe((0, csv_parser_1.default)())
        .on('data', (data) => promotions.push(data))
        .on('end', async () => {
        try {
            const { insertedData } = await promotionsRepo.addNewRecords(promotions);
            res.status(201).json({ success: true, data: insertedData });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error });
        }
    })
        .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        res.status(500).json({ success: false, error: 'Failed to read CSV file' });
    });
};
exports.insertsPromotionsToDb = insertsPromotionsToDb;
//# sourceMappingURL=promotions.js.map