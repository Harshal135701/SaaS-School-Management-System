const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Teacher = sequelize.define(
  "Teacher",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    franchiseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "franchises",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    // =========================
    // BASIC INFORMATION
    // =========================

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Teacher name is required",
        },
        len: {
          args: [2, 150],
          msg: "Teacher name must be between 2 and 150 characters",
        },
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Please provide a valid email address",
        },
      },
      set(value) {
        this.setDataValue(
          "email",
          value ? value.trim().toLowerCase() : null
        );
      },
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isValidPhone(value) {
          if (value && !/^[0-9+\-\s()]{7,20}$/.test(value)) {
            throw new Error("Please provide a valid phone number");
          }
        },
      },
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // =========================
    // EMPLOYMENT INFORMATION
    // =========================

    staffType: {
      type: DataTypes.ENUM("TEACHING", "NON_TEACHING"),
      allowNull: false,
      defaultValue: "TEACHING",
    },

    role: {
      type: DataTypes.ENUM(
        "TEACHER",
        "HOD",
        "PRINCIPAL",
        "ACCOUNTANT",
        "DATA_ENTRY",
        "SUPPORT"
      ),
      allowNull: false,
      defaultValue: "TEACHER",
    },

    qualification: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    joiningDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    // =========================
    // GOVERNMENT / IDENTITY
    // =========================

    panNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isValidPAN(value) {
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) {
            throw new Error("Invalid PAN number");
          }
        },
      },
      set(value) {
        this.setDataValue(
          "panNumber",
          value ? value.trim().toUpperCase() : value
        );
      },
    },

    aadhaarNumber: {
      type: DataTypes.STRING(12),
      allowNull: true,
      validate: {
        isValidAadhaar(value) {
          if (value && !/^[0-9]{12}$/.test(value)) {
            throw new Error("Aadhaar number must contain exactly 12 digits");
          }
        },
      },
    },

    // =========================
    // AUTHENTICATION
    // =========================

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },


  },
  {
    tableName: "teachers",
    timestamps: true,


    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },

    scopes: {
      withPassword: {
        attributes: {
          include: ["password"],
        },
      },
    },

    indexes: [
      {
        fields: ["franchiseId"],
      },
      {
        fields: ["email"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["staffType"],
      },
      {
        fields: ["role"],
      },
      {
        fields: ["panNumber"],
      },
    ],


  }
);

module.exports = Teacher;
