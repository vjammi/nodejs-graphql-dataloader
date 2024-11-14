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

#### ProductsController
```
import io.dev.api.model.Product;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductsController {
  List<Product> products = List.of(
    new Product("1", "Apple MacBook Pro", true),
    new Product("2", "Apple MacBook Air", false),
    new Product( "3","Apple iPhone SE", true)
  );
  @RequestMapping("/products")
  public List<Product> products(){
    System.out.println("Products: " +products);
    return this.products;
  }
}
```
```
public record Product(String id, String  name, boolean verified) {
}
```
#### ReviewsController
```
import io.dev.api.model.Review;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewsController {
  List<Review> reviews = List.of(
    new Review("1", "1", "Excellent", 5),
    new Review("2", "2", "Very Good", 4),
    new Review("3", "3", "Good", 3)
  );
  @RequestMapping("/reviews")
  public List<Review> reviews(@RequestParam String productIds){
    String[] productIdBatch = productIds.split(",");

    List<Review> reviews = new ArrayList<>();
    for (String productId: productIdBatch){
      for (Review review: this.reviews){
        if (review.id().equals(productId)) reviews.add(review);
      }
      System.out.println("productId: " + productId +" reviews: " +reviews);
    }
    return reviews;
  }
}
```
```
public record Review(String id, String productId, String content, int rating) {
}
```