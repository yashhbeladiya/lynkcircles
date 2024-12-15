const NEWS_URL = "https://newsapi.org/v2/";
import axios from "axios";

export const getNews = async (req, res) => {
  console.log("Received request with query:", req.query);
  try {
    const { datePublished, keyword, place, language } = req.query;
    // Map `place` to `country` (for News API)
    const countryMap = {
      "United States": "us",
      "United Kingdom": "gb",
      Canada: "ca",
      Australia: "au",
      India: "in",
      Global: "", // Leave empty for no country filter
    };

    // Map `language`
    const languageMap = {
      Arabic: "ar",
      German: "de",
      English: "en",
      Spanish: "es",
      French: "fr",
      Hebrew: "he",
      Italian: "it",
      Dutch: "nl",
      Norwegian: "no",
      Portuguese: "pt",
      Russian: "ru",
      Swedish: "sv",
      Urdu: "ud",
      Chinese: "zh",
    };

    const params = {
        keyword: keyword || "latest",
      country: countryMap[place] || "us",
      from: datePublished.split("T")[0],
      language: languageMap[language] || "en",
      apiKey: process.env.NEWS_API,
    };

    // const URL =
    //   `${NEWS_URL}everything?` +
    //   `q=${keyword}&from=${params.from}&sortBy=publishedAt&apiKey=${params.apiKey}`;
    // console.log("URL:", URL);

    if (keyword === "latest") {
      const URL =
        `${NEWS_URL}top-headlines?` +
        `country=${params.country}&apiKey=${params.apiKey}`;
      console.log("URL:", URL);

      const response = await axios.get(URL);
      res.status(200).json(response.data || []);
        return;
    } else {

    const URL =
        `${NEWS_URL}everything?` +
        `q=${params.keyword}&from=${params.from}&language=${params.language}&apiKey=${params.apiKey}`;

    console.log("URL:", URL);

    const response = await axios.get(URL);
    res.status(200).json(response.data);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHeadlines = async (req, res) => {
  console.log("Received request with query:", req.query);
  try {
    const { topic, keyword, place } = req.query;
    // Map `place` to `country` (for News API)
    const countryMap = {
      "United States": "us",
      "United Kingdom": "gb",
      Canada: "ca",
      Australia: "au",
      India: "in",
      Global: "", // Leave empty for no country filter
    };

    const params = {
      country: countryMap[place] || "us",
      apiKey: process.env.NEWS_API,
    };

    const URL =
      `${NEWS_URL}top-headlines?` +
      `country=${params.country}&apiKey=${params.apiKey}`;
    console.log("URL:", URL);

    const response = await axios.get(URL);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
