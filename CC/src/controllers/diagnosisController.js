const { Sequelize } = require("sequelize");
const Diagnosis = require("../models/diagnosisModel");
const User = require("../models/userModel");
const Antibiotic = require("../models/antibioticModel");
const Symptom = require("../models/symptomModel");
const axios = require("axios");

exports.createDiagnosis = async (req, res) => {
  try {
    // Mendapatkan userID dari token yang terautentikasi
    const userID = req.userID;

    // Validasi input gejala
    const { symptoms } = req.body;
    if (
      !symptoms ||
      !Array.isArray(symptoms) ||
      symptoms.length === 0 ||
      symptoms.some(
        (symptom) => typeof symptom !== "string" || symptom.trim().length === 0
      )
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Gejala harus dalam bentuk array dan minimal 1 gejala yang tidak kosong.",
      });
    }

    // Cek apakah userID valid
    if (!userID) {
      return res.status(400).json({
        status: "fail",
        message: "UserID tidak ditemukan. Pastikan Anda sudah login.",
      });
    }

    // Cek apakah pengguna dengan userID yang diberikan ada di database
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Pengguna tidak ditemukan.",
      });
    }

    // Panggil API Flask untuk melakukan diagnosis
    const flaskApiUrl =
      "https://flask-dot-united-planet-442804-p8.et.r.appspot.com/predict";

    // Pastikan API Flask menerima gejala yang benar
    const response = await axios.post(flaskApiUrl, { symptoms });

    if (response.data && response.data.prediction) {
      const { disease, probability } = response.data.prediction;

      // Cari data penyakit pada tabel antibiotics berdasarkan disease yang ditemukan
      const antibiotic = await Antibiotic.findOne({
        where: {
          disease: disease,
        },
      });

      if (!antibiotic) {
        return res.status(404).json({
          status: "fail",
          message: "Penyakit tidak ditemukan dalam data antibiotik.",
        });
      }

      // Simpan diagnosis ke tabel Diagnosis
      const diagnosis = await Diagnosis.create({
        userID,
        disease,
        disease_description: antibiotic.disease_description,
        antibiotic_frequency_usage_per_day:
          antibiotic.antibiotic_frequency_usage_per_day,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Kembalikan respon dengan tambahan nama antibiotik
      return res.status(201).json({
        status: "success",
        message: "Diagnosis berhasil",
        diagnosis: {
          userID,
          diagnosisID: diagnosis.diagnosisID,
          disease,
          probability,
          disease_description: antibiotic.disease_description,
          antibiotic_name: antibiotic.antibiotics_name,
          antibiotics_usage: antibiotic.antibiotics_usage,
          antibiotics_description: antibiotic.antibiotics_description,
          antibiotics_dosage: antibiotic.antibiotics_dosage,
          antibiotics_dosage: antibiotic.antibiotics_dosage,
          antibiotic_frequency_usage_per_day:
            antibiotic.antibiotic_frequency_usage_per_day,
          antibiotic_total_days_of_usage:
            antibiotic.antibiotic_total_days_of_usage,
          others: antibiotic.others,
          antibiotic_image: antibiotic.antibiotic_image,
        },
      });
    } else {
      return res.status(502).json({
        status: "fail",
        message: "Gagal menerima respon yang valid dari API Flask.",
      });
    }
  } catch (error) {
    console.error("Error in createDiagnosis:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        status: "fail",
        message: error.response.data
          ? error.response.data.message
          : "Error dari API Flask.",
      });
    }

    return res.status(500).json({
      status: "fail",
      message: error.message || "Terjadi kesalahan internal.",
    });
  }
};

exports.diagnosisHistory = async (req, res) => {
  try {
    // Mendapatkan userID dari token autentikasi
    const userID = req.userID;

    // Cek apakah userID valid
    if (!userID) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
      });
    }

    // Ambil semua riwayat diagnosis dari tabel Diagnosis berdasarkan userID
    const diagnosisHistory = await Diagnosis.findAll({
      where: { userID },
      attributes: ["diagnosisID", "disease", "createdAt"],
    });

    // Jika riwayat diagnosis kosong
    if (!diagnosisHistory || diagnosisHistory.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Riwayat diagnosis tidak ditemukan.",
      });
    }

    // Ambil data antibiotik berdasarkan disease untuk setiap diagnosis
    const diagnosisWithAntibiotic = await Promise.all(
      diagnosisHistory.map(async (diagnosis) => {
        // Cari antibiotik berdasarkan disease
        const antibiotic = await Antibiotic.findOne({
          where: { disease: diagnosis.disease },
          attributes: [
            "antibioticID",
            "disease_description",
            "antibiotics_name",
            "antibiotics_usage",
            "antibiotics_description",
            "antibiotics_dosage",
            "antibiotic_frequency_usage_per_day",
            "antibiotic_total_days_of_usage",
            "others",
            "antibiotic_image",
          ],
        });

        // Jika antibiotik tidak ditemukan
        if (!antibiotic) {
          throw new Error(
            `Antibiotik untuk penyakit ${diagnosis.disease} tidak ditemukan.`
          );
        }

        // Gabungkan data diagnosis dengan antibiotik
        return {
          diagnosisID: diagnosis.diagnosisID,
          antibioticID: antibiotic.antibioticID,
          disease: diagnosis.disease,
          disease_description: antibiotic.disease_description,
          antibiotic_name: antibiotic.antibiotics_name,
          antibiotics_usage: antibiotic.antibiotics_usage,
          antibiotics_description: antibiotic.antibiotics_description,
          antibiotics_dosage: antibiotic.antibiotics_dosage,
          antibiotics_dosage: antibiotic.antibiotics_dosage,
          antibiotic_frequency_usage_per_day:
            antibiotic.antibiotic_frequency_usage_per_day,
          antibiotic_total_days_of_usage:
            antibiotic.antibiotic_total_days_of_usage,
          others: antibiotic.others,
          antibiotic_image: antibiotic.antibiotic_image,
          createdAt: diagnosis.createdAt,
        };
      })
    );

    // Kirim respon dengan riwayat diagnosis dan antibiotik
    return res.status(200).json({
      status: "success",
      message: "Riwayat diagnosis berhasil diambil.",
      userID,
      diagnosisHistory: diagnosisWithAntibiotic, // Return hasil riwayat dengan antibiotik
    });
  } catch (error) {
    console.error("Error in diagnosisHistory:", error.message);
    return res.status(500).json({
      status: "fail",
      message: error.message || "Terjadi kesalahan internal.",
    });
  }
};

exports.getAllSymptom = async (req, res) => {
  try {
    const symptoms = await Symptom.findAll();

    if (!symptoms) {
      return res.status(404).json({
        status: "success",
        message: "Gejala Tidak Ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Gejala berhasil ditemukan",
      symptoms,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
