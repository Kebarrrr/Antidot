const { Op } = require("sequelize");
const Antibiotic = require("../models/antibioticModel");

const getAllAntibiotics = async (req, res) => {
  try {
    // Ambil semua data antibiotik dengan atribut yang sesuai
    const antibiotics = await Antibiotic.findAll({
      attributes: [
        "antibioticID",
        "disease",
        "antibiotics_name",
        "antibiotics_usage",
        "antibiotics_dosage",
        "antibiotics_description",
        "antibiotic_frequency_usage_per_day",
        "antibiotic_total_days_of_usage",
        "others",
        "antibiotic_image",
      ],
    });

    if (antibiotics.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Data antibiotik tidak ditemukan.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data antibiotik berhasil ditemukan.",
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

    const antibioticByID = await Antibiotic.findOne({
      where: { antibioticID: id },
      attributes: [
        "antibioticID",
        "disease",
        "antibiotics_name",
        "antibiotics_usage",
        "antibiotics_dosage",
        "antibiotics_description",
        "antibiotic_frequency_usage_per_day",
        "antibiotic_total_days_of_usage",
        "others",
        "antibiotic_image",
      ],
    });

    if (!antibioticByID) {
      return res.status(404).json({
        status: "fail",
        message: "Data antibiotik tidak ditemukan.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data antibiotik berhasil ditemukan.",
      antibioticByID,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const searchAntibiotic = async (req, res) => {
  try {
    const { query } = req.params; // Mendapatkan query dari parameter URL

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Cari antibiotik berdasarkan nama antibiotik
    const antibiotics = await Antibiotic.findAll({
      attributes: [
        "antibioticID",
        "disease",
        "antibiotics_name",
        "antibiotics_usage",
        "antibiotics_dosage",
        "antibiotics_description",
        "antibiotic_frequency_usage_per_day",
        "antibiotic_total_days_of_usage",
        "others",
        "antibiotic_image",
      ],
      where: {
        antibiotics_name: {
          [Op.like]: `%${query}%`, // Cari berdasarkan nama antibiotik
        },
      },
    });

    if (antibiotics.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Data antibiotik tidak ditemukan.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Data antibiotik berhasil ditemukan.",
      data: antibiotics, // Return data antibiotik yang ditemukan
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllAntibiotics,
  getAntibioticById,
  searchAntibiotic,
};
