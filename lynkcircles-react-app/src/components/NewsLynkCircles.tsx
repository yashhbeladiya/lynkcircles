//@ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import { axiosInstance } from "../lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

const NewsLynkCircles = () => {
  // State management
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Query client
  const queryClient = useQueryClient();

  // Search parameters
  const [searchParams, setSearchParams] = useState({
    datePublished: "",
    place: "",
    language: "",
    keyword: "",
  });

  const LANGUAGES = [
    "Arabic",
    "German",
    "English",
    "Spanish",
    "French",
    "Hebrew",
    "Italian",
    "Dutch",
    "Norwegian",
    "Portuguese",
    "Russian",
    "Swedish",
    "Urdu",
    "Chinese",
  ];

  const PLACES = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "India",
    "Global",
  ];

  const { data: newsData } = useQuery({
    queryKey: ["news", searchParams],
    queryFn: async () => {
      if (
        searchParams.datePublished === "" &&
        searchParams.language === "" &&
        searchParams.keyword === ""
      ) {
        return await axiosInstance.get(`/news/headlines`, {
          params: searchParams,
        });
      } else {
        return await axiosInstance.get(`/news`, {
          params: searchParams,
        });
      }
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  // Fetch news
  const fetchNews = async () => {
    setLoading(true);
    try {
      await queryClient.fetchQuery({ queryKey: ["news", searchParams] });
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  // Handle search parameter change
  const handleSearchParamChange = (key, value) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
  };

  // Update news state
  useEffect(() => {
    if (newsData) {
      // remove removed articles from the news state
      newsData.data.articles = newsData.data.articles.filter(
        (article) => article.title !== "[Removed]"
      );
      setNews(newsData.data.articles);
    }
  }, [newsData]);

  // Initial news fetch
  useEffect(() => {
    setSearchParams({
      datePublished: "",
      language: "",
      place: "United States",
      keyword: "",
    });
    fetchNews();
  }, []);

  // Render single news card
  const NewsCard = ({ article }) => (
    <Link to={article.url} target="_blank" style={{ textDecoration: "none" }}>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          transition: "transform 0.3s",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        {article.urlToImage && (
          <CardMedia
            component="img"
            height="200"
            image={article.urlToImage}
            alt={article.title}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {article.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {article.description?.slice(0, 150)}...
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            <Typography variant="caption">
              {article.source?.name || "Unknown Source"}
            </Typography>
            <Typography variant="caption">
              {new Date(article.publishedAt).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" color="secondary" align="center" gutterBottom>
          LynkCircles News
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <TextField
                type="date"
                value={searchParams.datePublished}
                onChange={(e) =>
                  handleSearchParamChange("datePublished", e.target.value)
                }
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Place</InputLabel>
              <Select
                value={searchParams.place}
                label="Place"
                onChange={(e) =>
                  handleSearchParamChange("place", e.target.value)
                }
              >
                {PLACES.map((place) => (
                  <MenuItem key={place} value={place}>
                    {place}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={searchParams.language}
                label="Language"
                onChange={(e) =>
                  handleSearchParamChange("language", e.target.value)
                }
              >
                {LANGUAGES.map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Keyword"
              value={searchParams.keyword}
              onChange={(e) =>
                handleSearchParamChange("keyword", e.target.value)
              }
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={fetchNews}
                    sx={{ padding: "8px 24px" }}
                    startIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : error ? (
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {news.map((article, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <NewsCard article={article} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* if length of news is 0 */}
      {news.length === 0 && !loading && !error && (
        <Typography variant="h6" color="textSecondary" align="center">
          No news found
        </Typography>
      )}
    </Container>
  );
};

export default NewsLynkCircles;
