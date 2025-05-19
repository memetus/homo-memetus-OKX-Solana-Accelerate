# homo-memetus-server

### ERD v0.1

```mermaid
erDiagram
  Topics ||--o{ competitors : embedded
  Topics ||--o{ UserTopics : topicId
  Topics ||--o{ Comments : topicId
  Topics ||--o{ Activities : topicId
  Topics ||--o{ ShareImages : topicId

  UserTopics ||--|{ Users : userId

  Users ||--o{ nftHolder : embedded

  coinData {
    string _id
    string name
    string symbol
    string address
    string[] type
    string marketCamp
    date createdAt
  }
```
