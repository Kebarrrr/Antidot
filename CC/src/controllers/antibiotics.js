const { where } = require("sequelize");
const antibiotic = require("../models/antibioticModel");

const getAllAntibiotics = async (req, res) => {
  try {
    const antibiotics = await antibiotic.findAll({
      attributes: ["antibioticName", "antibioticImage", "description"],
    });

    if (!antibiotics) {
      return res.status(404).json({
        status: "success",
        message: "Data antibiotik Tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data antibiotik Berhasil ditemukan",
      antibiotics,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getAntibioticById = async (req, res) => {
  try {
    const { id } = req.params;

    const antibioticByID = await antibiotic.findOne({
      where: { antibioticID: id },
    });

    if (!antibioticByID) {
      return res.status(404).json({
        status: "success",
        message: "Data antibiotik Tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data antibiotik berhasil ditemukan",
      antibioticByID,
    });
  } catch (error) {}
};

module.exports = {
  getAllAntibiotics,
  getAntibioticById,
};
