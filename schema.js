export const typeDefs = `#graphql 
  type Review {
    id: ID!
    productId: ID!
    content: String!
    rating: Int!    
  }
  type Product {
    id: ID!
    name: String!    
    reviews: [Review!]
  }
  type Query {
    products: [Product]          
  }
`