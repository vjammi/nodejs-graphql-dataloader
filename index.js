import {ApolloServer} from '@apollo/server'
import {startStandaloneServer} from '@apollo/server/standalone'
import DataLoader from 'dataloader';
import {typeDefs} from './schema.js'

// Fetch data from a simulated REST API
const fetchProducts = async () => {
  const response = await fetch('http://localhost:8080/api/products')
  const products = await response.json();
  return products;
};

const fetchReviewsByProductIds = async (productIds) => {
  const responses = await Promise.all(productIds.map(
      id => fetch(`http://localhost:8080/api/reviews?productIds=${id}`)
          .then(res => res.json())
  ));
  return responses;
};

// Set up DataLoader to batch and cache review requests by product IDs
const reviewLoader = new DataLoader(async (productIds) => {
  // `productIds` will be an array of unique product IDs
  const reviewsArray = await fetchReviewsByProductIds(productIds);
  console.log(reviewsArray);

  // Map each product's reviews to the corresponding product ID
  return productIds.map(id => {
    console.log(id, reviewsArray);
    let reviewsResp = reviewsArray.find(reviews => {
      let boolVal = reviews[0]?.productId === id;
      return boolVal;
    }) || [];
    return reviewsResp;
      }
  );
});

// resolvers
const resolvers = {
  Query: {
    products: async () => {
      // Fetch products from the REST API
      return fetchProducts();
    },
  },
  Product: {
    reviews: async (product) => {
      // Use DataLoader to load reviews for the current product in a batch
      return reviewLoader.load(product.id);
    }
  }
}

// server setup
const server = new ApolloServer({
  typeDefs,
  resolvers
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 }
})

console.log(`Server ready at: ${url}`)