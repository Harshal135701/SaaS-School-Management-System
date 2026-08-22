const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");

const {
  Franchise,
  FranchiseAdmin,
  Plan,
  Contract,
  MonthlyRoyalty,
  Student,
  Teacher,
} = require("../models");

const createFranchise = async (req, res) => {
  try {
    const {
      name,
      code,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      planId,
    } = req.body;

    if (
      !name ||
      !code ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !planId
    ) {
      return res.status(400).json({
        success: false,
        message: "All franchise fields including plan are required",
      });
    }

    const existingFranchise = await Franchise.findOne({
      where: { code },
    });

    if (existingFranchise) {
      return res.status(409).json({
        success: false,
        message: "Franchise code already exists",
      });
    }

    const plan = await Plan.findByPk(planId);

    if (!plan || !plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive plan",
      });
    }

    const franchise = await Franchise.create({
      name,
      code,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      planId,
    });

    return res.status(201).json({
      success: true,
      message: "Franchise created successfully",
      data: franchise,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create franchise",
    });
  }
};

const getFranchises = async (req, res) => {
  try {
    const franchises = await Franchise.findAll({
      include: [
        {
          model: FranchiseAdmin,
          as: "admin",
          attributes: ["id", "name", "email", "isActive"],
        },

        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "price", "billingCycle"],
        },

        {
          model: Contract,
          as: "contracts",
          attributes: [
            "id",
            "agreementNumber",
            "agreementType",
            "startDate",
            "endDate",
            "status",
          ],
        },

        {
          model: MonthlyRoyalty,
          as: "monthlyRoyalties",
          attributes: [
            "id",
            "billingMonth",
            "royaltyAmount",
            "totalAmount",
            "status",
            "dueDate",
          ],
          separate: true,
          limit: 1,
          order: [["billingMonth", "DESC"]],
        },

        {
          model: Student,
          as: "students",
          attributes: [],
          required: false,
        },

        {
          model: Teacher,
          as: "teachers",
          attributes: [],
          required: false,
        },
      ],

      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM students AS students
              WHERE students."franchiseId" = "Franchise"."id"
            )`),
            "studentCount",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM teachers AS teachers
              WHERE teachers."franchiseId" = "Franchise"."id"
            )`),
            "teacherCount",
          ],
        ],
      },

      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: franchises.length,
      data: franchises,
    });
  } catch (error) {
    console.error("Get Franchises Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch franchises",
      error: error.message,
    });
  }
};

const getFranchiseById = async (req, res) => {
  try {
    const { id } = req.params;

    const franchise = await Franchise.findByPk(id, {
      include: [
        {
          model: FranchiseAdmin,
          as: "admin",
          attributes: ["id", "name", "email", "isActive", "createdAt"],
        },
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
              where: {
                isActive: true,
              },
              required: false,
            },
          ],
        },
      ],
    });

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: franchise,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch franchise",
    });
  }
};

const updateFranchiseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    const franchise = await Franchise.findByPk(id);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    franchise.status = status;
    await franchise.save();

    return res.status(200).json({
      success: true,
      message: `Franchise ${status.toLowerCase()} successfully`,
      data: franchise,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update franchise status",
    });
  }
};

const createFranchiseAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const franchise = await Franchise.findByPk(id);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    const existingAdmin = await FranchiseAdmin.findOne({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await FranchiseAdmin.create({
      name,
      email,
      password: hashedPassword,
      franchiseId: id,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Franchise admin created successfully",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        franchiseId: admin.franchiseId,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create franchise admin",
    });
  }
};

const updateFranchisePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "planId is required",
      });
    }

    const franchise = await Franchise.findByPk(id);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    const plan = await Plan.findByPk(planId);

    if (!plan || !plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive plan",
      });
    }

    franchise.planId = planId;
    await franchise.save();

    return res.status(200).json({
      success: true,
      message: "Franchise plan updated successfully",
      data: {
        franchiseId: franchise.id,
        planId: franchise.planId,
        plan: plan.name,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update franchise plan",
    });
  }
};


module.exports = {
  createFranchise, getFranchises, getFranchiseById, updateFranchiseStatus, createFranchiseAdmin, updateFranchisePlan
};