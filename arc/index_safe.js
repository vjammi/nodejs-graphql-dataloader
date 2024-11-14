import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
//import {executeGetCall} from './ExecuteGetCall.js'
//const DataLoader = require('dataloader');
import DataLoader from 'dataloader';

// data
import db from '../_db.js'

// types
import { typeDefs } from '../schema.js'
import * as assert from "node:assert";

async function fetchData(url) {
  const response = await fetch(url);
  const json = await response.json();
  console.log("Json ", json);
  return json;
  // return fetch(url)
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //
  //       // Determine the content type and process accordingly
  //       const contentType = response.headers.get('content-type');
  //       if (contentType && contentType.includes('application/json')) {
  //         console.log("Response Json: ", response.json());
  //         return response; // Parse as JSON
  //       } else if (contentType && contentType.includes('text/plain')) {
  //         console.log("Response Text: ", response.json());
  //         return response.text(); // Parse as plain text
  //       } else {
  //         // Handle other content types or throw an error
  //         throw new Error('Unexpected content type');
  //       }
  //     }
  //    )
  //     .then(data => {
  //       console.log("Returning Data: ", data);
  //       return data;
  //     })
  //     .catch(error => {
  //       console.error('There was a problem with the fetch operation:', error);
  //     });
}

//const DataLoader = require('dataloader');
//const fetch = require('node-fetch'); // Or use axios if preferred

// -------------------------
// Create the DataLoader
const apiDataLoader = new DataLoader(async (urls) => {
  // Batch call to the REST API for each URL
  const requests = urls.map(url => fetch(url).then(response => response.json()));

  // Resolve all requests and return results
  return Promise.all(requests);
});

//---------------------------
// Fetch data from a simulated REST API
const fetchProducts = async () => {
  const response = await fetch('http://localhost:8080/api/products')
  const products = await response.json();
  return products;
};

const fetchReviewsByProductIds = async (productIds) => {
  //console.log({id})
  // const response = await fetch('http://localhost:8080/api/reviews?productIds=1')
  // const reviews = await response.json();
  // return reviews;
  const responses = await Promise.all(productIds.map(
      id => fetch(`http://localhost:8080/api/reviews?productIds=${id}`)
          .then(res => res.json())
  ));
  return responses;
};
//-------------------------
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
//-------------------------


// resolvers
const resolvers = {
  Query: {
    product: async (_, args) => {
      let product = db.products.find((product) => product.id === args.id);
      return product
    },
    products: async () => {
      // Fetch products from the REST API
      return fetchProducts();
    },

    // author(_, args) {
    //   let author = db.authors.find((author) => author.id === args.id);
    //   return author
    // },
    // async authors() {
    //   // let authors = db.authors;
    //   // console.log(authors)
    //   // return authors;
    //
    //   const url = 'http://localhost:8080/api/authors';
    //   //return await executeGetCall(fetchData, url);
    //
    //   const response = await fetch(url);
    //   const json = await response.json();
    //   console.log("Json ", json);
    //   return json;
    //
    //   // Using the DataLoader to fetch user data from a REST API
    //   //const author = await apiDataLoader.load(`http://localhost:8080/api/authors`);
    //   // return author;
    // },

    // games() {
    //   return db.games
    // },
    // game(_, args) {
    //   return db.games.find((game) => game.id === args.id)
    // },

    // review(_, args) {
    //   let review = db.reviews.find((review) => review.id === args.id);
    //   return review
    // },
    // reviews() {
    //   let reviews = db.reviews;
    //   console.log("Reviews ", reviews);
    //   return reviews
    // }
  },
  Product: {
    reviews: async (product) => {
      // Use DataLoader to load reviews for the current product in a batch
      return reviewLoader.load(product.id);
    }
  },

  // Game: {
  //   reviews(parent) {
  //     return db.reviews.filter((r) => r.game_id === parent.id)
  //   }
  // },

  // Review: {
  //   author(parent) {
  //     let review = db.authors.find((a) => a.id === parent.author_id);
  //     return review
  //   }
  // },
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