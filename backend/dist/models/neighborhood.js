"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neighborhood = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const NeighborhoodSchema = new mongoose_1.default.Schema({
    neighborhood: {
        type: String,
        required: true,
    },
    timeLivingInNeighborhood: {
        type: String,
        required: true,
    },
    neighborhoodDescription: {
        type: String,
        required: true,
    },
    neighborhoodAdjectives: [],
    residentAdjectives: [],
    foodCulture: {
        type: String,
        required: true,
    },
    foodIsAuthentic: {},
    foodPrices: {},
    onePlaceToEat: {},
    mostUniqueThingAboutNeighborhood: {
        type: String,
        required: true,
    },
    peopleShouldVisitNeighborhoodIfTheyWant: {
        type: String,
        required: true,
    },
    typicalResidentDescription: {
        type: String,
        required: false
    },
    recommendedFoodTypes: [],
    neighborhoodImages: [],
    nightLife: {
        type: String,
        required: true,
    },
    nightLifeRecommendations: [],
    onePlaceForNightLife: {},
    statements: {},
    userId: {
        type: String,
        required: false,
    },
    orderId: {
        // not required bc when a resident is first created, there will be no order associated with it.
        type: String,
    },
    user: {
        id: { type: String, required: false },
        name: { type: String, required: false },
        email: { type: String, required: false }
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
;
NeighborhoodSchema.statics.build = (attrs) => {
    return new Neighborhood(attrs);
};
const Neighborhood = mongoose_1.default.model("Resident", NeighborhoodSchema);
exports.Neighborhood = Neighborhood;
//# sourceMappingURL=neighborhood.js.map
