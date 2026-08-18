const { Plan, Feature } = require("../models");

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: {
        isActive: true,
      },
      include: [
        {
          model: Feature,
          as: "features",
          through: {
            attributes: [],
          },
          where: {
            isActive: true,
          },
          required: false,
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
    });
  }
};

const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByPk(id, {
      include: [
        {
          model: Feature,
          as: "features",
          through: {
            attributes: [],
          },
          where: {
            isActive: true,
          },
          required: false,
        },
      ],
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
    });
  }
};

module.exports = {
  getPlans,getPlanById
};