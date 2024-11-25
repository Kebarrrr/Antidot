const antibiotic = require("../models/antibioticModel");

const getAllAntibiotics = async (req, res) => {
  try {
    const antibiotics = await antibiotic.findAll();

    let response = "";
    if (!antibiotics) {
      return res.status(404).json({
        status: "success",
        message: "Data antibiotik Tidak Ditemukan",
      });
    } else {
      response = await antibiotic.findAll({
        attributes: ["antibioticName"],
      });
      res.status(200).json({
        status: "success",
        message: "Data antibiotik Berhasil di GET",
        antibiotics: response,
      });
    }
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

module.exports = {
  getAllAntibiotics,
};
