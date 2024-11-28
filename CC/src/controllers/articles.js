const Article = require("../models/articleModel");

const getArticle = async (req, res) => {
  try {
    const article = await Article.findAll();

    if (!article) {
      return res.status(404).json({
        status: "success",
        message: "Artikel Tidak Ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Artikel berhasil ditemukan",
      article,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = { getArticle };
