#### Query
```
query Query {
  products {
    id
    name
    reviews {
      id      
      rating
      content
    }
  }
  # product(id: 1) {
  #   id
  #   name
  #   reviews {
  #     id      
  #     rating
  #     content
  #   }
  # }
}
```

#### Schema
```
  type Query {
    products: [Product]          
  }
  
  type Product {
    id: ID!
    name: String!    
    reviews: [Review!]
  }

  type Review {
    id: ID!
    productId: ID!
    content: String!
    rating: Int!    
  }
```

#### _db
```
  List<Product> products = List.of(
    new Product("1", "Apple MacBook Pro", true),
    new Product("2", "Apple MacBook Air", false),
    new Product( "3","Apple iPhone SE", true)
  );
```
```
    new Review("1", "1", "Excellent", 5),
    new Review("2", "2", "Very Good", 4),
    new Review("3", "3", "Good", 3)
```