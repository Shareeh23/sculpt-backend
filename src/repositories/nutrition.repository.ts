import { NutritionProfileModel } from "../models/nutrition-profile.model.js";
import type { NutritionProfile } from "../models/nutrition-profile.model.js";

type CreateNutritionProfileData = Omit<
  NutritionProfile,
  "userId" | "createdAt" | "updatedAt"
> & {
  userId: string;
};

class NutritionRepository {
  async findByUserId(userId: string) {
    return NutritionProfileModel.findOne({
      userId,
    });
  }

  async create(data: CreateNutritionProfileData) {
    return NutritionProfileModel.create(data);
  }

  async updateByUserId(
    userId: string,
    data: Partial<Omit<NutritionProfile, "userId">>,
  ) {
    return NutritionProfileModel.findOneAndUpdate(
      {
        userId,
      },
      {
        $set: data,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
  }

  async deleteByUserId(userId: string) {
    return NutritionProfileModel.findOneAndDelete({
      userId,
    });
  }
}

export const nutritionRepository = new NutritionRepository();
