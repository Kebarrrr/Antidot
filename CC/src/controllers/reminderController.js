const User = require("../models/userModel");
const Antibiotics = require("../models/antibioticModel");
const Reminder = require("../models/reminderModel");
const Diagnosis = require("../models/diagnosisModel"); // Mengimpor model Diagnosis
const user = require("../models/userModel");

// Membuat reminder baru
const createReminder = async (req, res) => {
  try {
    const userID = req.userID;

    const {
      antibioticID,
      customAntibioticName,
      reminderFrequency,
      reminderTimes,
      diagnosisID,
    } = req.body;

    // Cek apakah userID valid
    if (!userID) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
      });
    }

    // Validasi input
    if (!userID || !reminderFrequency) {
      return res.status(400).json({
        status: "fail",
        message: "UserID and reminderFrequency are required.",
      });
    }

    let selectedAntibiotic = null;
    let antibioticName = null;
    let finalReminderFrequency = reminderFrequency; // Default to the provided reminderFrequency
    let finalAntibioticID = antibioticID;

    // **Skenario 1**: Jika ada diagnosisID, cari antibiotik berdasarkan penyakit
    if (diagnosisID) {
      const diagnosis = await Diagnosis.findByPk(diagnosisID);
      if (!diagnosis) {
        return res.status(404).json({
          status: "fail",
          message: "Diagnosis not found.",
        });
      }

      // Ambil nama penyakit dari diagnosis
      const disease = diagnosis.disease.toLowerCase(); // Gunakan lowercase untuk menghindari masalah kapitalisasi

      // Cari antibiotik berdasarkan nama penyakit
      selectedAntibiotic = await Antibiotics.findOne({
        where: { disease: disease },
      }); // Pencarian berdasarkan kolom disease

      if (!selectedAntibiotic) {
        return res.status(404).json({
          status: "fail",
          message: `Antibiotic for disease ${disease} not found in the Antibiotics table.`,
        });
      }

      // Ambil antibioticID dan antibiotics_name dari tabel Antibiotics
      antibioticName = selectedAntibiotic.antibiotics_name;
      finalAntibioticID = selectedAntibiotic.antibioticID; // Update antibioticID

      // Jika tidak ada reminderFrequency yang dikirimkan, ambil dari diagnosis
      if (!finalReminderFrequency) {
        finalReminderFrequency = diagnosis.antibiotic_frequency_usage_per_day;
      }
    }
    // **Skenario 2**: Jika menggunakan antibiotik custom (customAntibioticName)
    else if (customAntibioticName) {
      antibioticName = customAntibioticName;
      finalAntibioticID = null; // Antibiotik custom tidak perlu ID dari database
    }
    // **Skenario 3**: Jika ada antibioticID, cari antibiotik berdasarkan antibioticID
    else if (antibioticID) {
      selectedAntibiotic = await Antibiotics.findByPk(antibioticID);
      if (!selectedAntibiotic) {
        return res.status(404).json({
          status: "fail",
          message: "Antibiotic not found.",
        });
      }
      antibioticName = selectedAntibiotic.antibiotics_name; // Ambil antibiotics_name dari tabel Antibiotics
      finalAntibioticID = antibioticID; // Gunakan antibioticID yang diberikan
    }

    // Tentukan waktu reminder berdasarkan reminderFrequency
    let defaultTimes = [];
    if (finalReminderFrequency === "1x sehari") {
      defaultTimes = ["06:00"];
    } else if (finalReminderFrequency === "2x sehari") {
      defaultTimes = ["06:00", "18:00"];
    } else if (finalReminderFrequency === "3x sehari") {
      defaultTimes = ["06:00", "14:00", "22:00"];
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid reminderFrequency.",
      });
    }

    // Gunakan waktu yang dikirimkan oleh pengguna jika ada, jika tidak, gunakan waktu default
    const finalTimes =
      reminderTimes && reminderTimes.length > 0 ? reminderTimes : defaultTimes;

    // Buat satu reminder untuk setiap frekuensi dosis
    const reminderTimeObjects = finalTimes.map((time) => {
      // Ambil tanggal saat ini
      const today = new Date();
      // Set waktu berdasarkan waktu yang dikirimkan
      const [hour, minute] = time.split(":");
      const reminderTime = new Date(today.setHours(hour, minute, 0, 0)); // Mengatur jam dan menit
      return reminderTime;
    });

    // Buat reminder
    const reminder = await Reminder.create({
      userID,
      antibioticID: finalAntibioticID,
      customAntibioticName: antibioticName || null,
      reminderFrequency: finalReminderFrequency,
      reminderTimes: finalTimes,
      deleted: 0,
    });

    res.status(201).json({
      status: "success",
      message: "Reminder created successfully.",
      reminder,
    });
  } catch (error) {
    console.error("Error creating reminder:", error.message); // Log error untuk debugging
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Fungsi deleteReminder dan getUserReminders tetap sama
const deleteReminder = async (req, res) => {
  try {
    const { reminderID } = req.params;

    const reminder = await Reminder.findByPk(reminderID);
    if (!reminder) {
      return res.status(404).json({
        status: "fail",
        message: "Reminder not found.",
      });
    }

    reminder.deleted = 1;
    await reminder.save();

    res.status(200).json({
      status: "success",
      message: "Reminder deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getUserReminders = async (req, res) => {
  try {
    const userID = req.userID;

    // Cek apakah userID valid
    if (!userID) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
      });
    }

    const reminders = await Reminder.findAll({
      where: { userID },
    });

    const formattedReminders = reminders.map((reminder) => {
      return {
        ...reminder.toJSON(),
        reminderTimes: JSON.parse(reminder.reminderTimes), // Parse string JSON menjadi array
      };
    });

    res.status(200).json({
      status: "success",
      userID,
      reminders: formattedReminders,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  createReminder,
  deleteReminder,
  getUserReminders,
};
