import mongoose from "mongoose";

//  properties to be provided when building an order
interface NeighborhoodAttrs {
  neighborhood: string;
  timeLivingInNeighborhood: string;
  neighborhoodDescription: string;
  neighborhoodAdjectives: [];
  mostUniqueThingAboutNeighborhood: string;
  peopleShouldVisitNeighborhoodIfTheyWant: string;
  residentAdjectives: [];
  typicalResidentDescription: string;
  foodCulture: string;
  foodIsAuthentic: {};
  foodPrices: { assesment: string, explanation: string };
  onePlaceToEat: {};
  recommendedFoodTypes: [];
  neighborhoodImages: [];
  nightLife: string;
  nightLifeRecommendations: [];
  onePlaceForNightLife: {};
  statements: {};
  user: { id: string, name: string, email: string };
}

// properties when the resident is saved to the data base
export interface NeighborhoodDoc extends mongoose.Document {
  neighborhood: string;
  timeLivingInNeighborhood: string;
  neighborhoodDescription: string;
  neighborhoodAdjectives: [];
  mostUniqueThingAboutNeighborhood: string;
  peopleShouldVisitNeighborhoodIfTheyWant: string;
  residentAdjectives: [];
  typicalResidentDescription: string;
  foodCulture: string;
  foodIsAuthentic: {};
  foodPrices: { assesment: string, explanation: string };
  onePlaceToEat: {};
  recommendedFoodTypes: [];
  neighborhoodImages: [];
  nightLife: string;
  nightLifeRecommendations: [];
  onePlaceForNightLife: {};
  statements: {};
  user: { id: string, name: string, email: string };
  // version: number;
  // orderId?: string;
}

// properties that the model itself contains
interface NeighborhoodModel extends mongoose.Model<NeighborhoodDoc> {
  build(attrs: NeighborhoodAttrs): NeighborhoodDoc;
}



const NeighborhoodSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// tell mongoose that we want to track the version of all these different documents using the field version:
// residentSchema.set("versionKey", "version");
// residentSchema.plugin(updateIfCurrentPlugin);

NeighborhoodSchema.statics.build = (attrs: NeighborhoodAttrs) => {
  return new Neighborhood(attrs);
};

const Neighborhood = mongoose.model<NeighborhoodDoc, NeighborhoodModel>(
  "Resident",
  NeighborhoodSchema
);

export { Neighborhood };
