const { Franchise, Plan, Feature } = require("../models");

const requireFeature = (featureCode) => {
  return async (req, res, next) => {
    try {
      const franchiseId = req.user?.franchiseId;

      if (!franchiseId) {
        return res.status(403).json({
          success: false,
          message: "Franchise access required",
        });
      }

      const franchise = await Franchise.findByPk(franchiseId, {
        include: [
          {
            model: Plan,
            as: "plan",
            include: [
              {
                model: Feature,
                as: "features",
                through: {
                  attributes: [],
                },
              },
            ],
          },
        ],
      });

      if (!franchise || !franchise.plan) {
        return res.status(403).json({
          success: false,
          message: "No active plan assigned",
        });
      }

      const hasFeature = franchise.plan.features.some(
        (feature) => feature.code === featureCode && feature.isActive
      );

      if (!hasFeature) {
        return res.status(403).json({
          success: false,
          message: `Feature ${featureCode} is not available in your plan`,
        });
      }

      req.feature = featureCode;

      next();
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to verify feature access",
      });
    }
  };
};

module.exports = requireFeature;