const { TransportRoute, Vehicle } = require("../models");

const createRoute = async (req, res) => {
  try {
    const {
      vehicleId,
      routeName,
      startPoint,
      endPoint,
      stops,
      departureTime,
      arrivalTime,
    } = req.body;

    if (
      !vehicleId ||
      !routeName ||
      !startPoint ||
      !endPoint ||
      !departureTime ||
      !arrivalTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const route = await TransportRoute.create({
      franchiseId: req.user.franchiseId,
      vehicleId,
      routeName,
      startPoint,
      endPoint,
      stops,
      departureTime,
      arrivalTime,
      status: "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Transport route created successfully",
      data: route,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "vehicleNumber", "vehicleType"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getRouteById = async (req, res) => {
  try {
    const route = await TransportRoute.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "vehicleNumber", "vehicleType"],
        },
      ],
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.json({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    await route.update(req.body);

    res.json({
      success: true,
      message: "Transport route updated successfully",
      data: route,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    await route.destroy();

    res.json({
      success: true,
      message: "Transport route deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
};