import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const EmotionMap = {
  Happy: ["joy", "cheerful", "grateful", "content", "hopeful", "delighted"],
  Sad: ["lonely", "heartbroken", "melancholy", "blue", "disappointed"],
  Angry: ["frustrated", "irritated", "annoyed", "enraged", "resentful"],
  Anxious: ["worried", "fearful", "nervous", "panicked", "uneasy"],
  Relaxed: ["calm", "peaceful", "serene", "mindful", "at ease"],
  Motivated: ["inspired", "ambitious", "determined", "driven", "energized"],
  Bored : ["apathy","indifference", "restlessness", "monotony","lethargy","disinterest"]
};

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/findbooks", async (req, res) => {
  const emotion = req.body.emotion;
  const subemotions = EmotionMap[emotion];

  if (!subemotions) {
    return res.status(400).send("Invalid emotion provided.");
  }

  const randomSubemotion = subemotions[Math.floor(Math.random() * subemotions.length)];
  const API_KEY = process.env.API_KEY;

  try {
    // Get total items count
    const totalResponse = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: {
        q: randomSubemotion,
        key: API_KEY,
        maxResults: 1,
      },
    });

    const totalItems = totalResponse.data.totalItems || 0;
    console.log("totla number of books" ,totalItems);
    const startIndex = Math.floor(Math.random()* 100);//totalItems > 3 ? Math.floor(Math.random() * (totalItems/2)) : 0;
    console.log("start index : " , startIndex);

    // // Get actual books
    const booksResponse = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: {
        q: randomSubemotion,
        maxResults: 3,
         key: API_KEY
      },
    });
    console.log(booksResponse.data);

    const books = (booksResponse.data.items || []).map((item) => ({
      title: item.volumeInfo?.title || "No Title",
      description: item.volumeInfo?.description || "No Description",
      image: item.volumeInfo?.imageLinks?.thumbnail || "/placeholder.jpg",
      price: item.saleInfo?.retailPrice?.amount
        ? `₹${item.saleInfo.retailPrice.amount}`
        : "Price Not Available",
      buyLink: item.saleInfo?.buyLink || "#",
    }));

    res.render("index.ejs", { books });
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).send("Failed to fetch books.");
  }
});

app.listen(port, () => {
  console.log("Running on Port:", port);
});
