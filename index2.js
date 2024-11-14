import express from 'express';
//Step 1: Define the DataLoader
import DataLoader from 'dataloader';
import fetch from 'node-fetch';

const app = express();

// Batch function that fetches all reviews for a list of product IDs
const reviewLoader = new DataLoader(async (productIds) => {
  // Convert productIds array to a comma-separated list for the batch endpoint
  const queryParam = productIds.join(',');

  // Fetch all reviews for these product IDs in a single request
  const response = await fetch(`http://localhost:8080/api/reviews?productIds=${queryParam}`);
  const reviewsByProduct = await response.json(); // Response should be like { "1": [...], "2": [...], ... }

  // Map each product ID to its corresponding array of reviews
  return productIds.map(productId => reviewsByProduct[productId] || []);
});

// Step 2: Using DataLoader in Resolvers
const resolvers = {
  Query: {
    products: async () => {
      // Fetch products (simulated data or another API call)
      return fetchProducts();
    }
  },
  Product: {
    reviews: async (product) => {
      // Use DataLoader to batch requests for reviews by product ID
      return reviewLoader.load(product.id);
    }
  }
};

// Simulated data
const allReviews = [
  { id: "101", productId: "1", content: "Great product!", rating: 5 },
  { id: "102", productId: "1", content: "Very useful.", rating: 4 },
  { id: "103", productId: "2", content: "Good value for money.", rating: 4 },
  { id: "104", productId: "3", content: "Not as expected.", rating: 2 },
];

// Endpoint to fetch reviews by product IDs
app.get('/reviews', (req, res) => {
  const productIds = req.query.productIds.split(',');

  // Filter reviews by the requested product IDs
  const reviewsByProduct = productIds.reduce((acc, productId) => {
    acc[productId] = allReviews.filter(review => review.productId === productId);
    return acc;
  }, {});

  res.json(reviewsByProduct);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
