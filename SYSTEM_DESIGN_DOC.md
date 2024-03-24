# Short URL API System Design Documentation

## Overview

This document outlines the design and architecture of the Short URL API, a system designed to provide URL shortening, redirection, and analytics services. It includes functional and non-functional requirements, assumptions, design decisions, API architecture, and strech goals.

## Requirements

### Functional Requirements

- **URL Shortening**: Users can input a long URL, and the server returns a short URL.
- **URL Redirection**: Users clicking on a short URL are redirected to the corresponding long URL.
- **Analytics**: Track how often a short URL is accessed within specified time frames (last 24 hours, past week, all-time).
- **Data Persistency**: All associated data must be persistent.
- **Testability**: Testable via `curl`.

### Non-Functional Requirements

- **Performance**: Very low latency for redirects (< 10ms).
- **Scalability**: Capable of supporting millions of short URLs in the future.
- **Security**: Ensure the uniqueness and privacy of short URLs.

## Assumptions

- **Traffic Volume**: Potentially supports up to 10 million URLs/day.
- **Short URL Length**: Aimed for maximum brevity to optimize storage costs.
- **Character Constraints**: Assumes alphanumeric characters for short URLs.
- **Customization**: No requirement for custom short URLs.
- **Reads-Writes Ratio**: Anticipating a heavy read scenario with a 10:1 ratio.
- **Writes Frequency**: Estimating 100 million writes/day.
- **API Lifespan**: Designed for a 10-year operational window.

## Back-of-the-Envelope Estimation

- **Queries Per Second (QPS)**:
  - Writes: Approximately 1160 (100 million/day / 24 hours / 3600 seconds)
  - Reads: Approximately 11600 (1160 writes * 10)

- **Storage for 10 Years**:
  - Per URL: Approximately 166 bytes (Unique IDs: 36 bytes, Long URLs: 100 bytes, Short URLs: 14 bytes, Timestamps: 16 bytes)
  - Total URLs: Approximately 365 billion (100 million/day * 365 days/year * 10 years)
  - Required Storage: Approximately 55 TB (365 billion URLs * 166 bytes)

## Design Decisions

- **Short URL Hash Function**:
  - **Option 1: Popular Hashing Algorithms (MD5, SHA-1, SHA-2)**
    - Advantages: Security, ready-to-use, unique output
    - Disadvantages: Large output size -> higher storage costs, collision risk if truncated, development and server overhead
  - **Option 2: Unique ID Generator + Base 62 Conversion**
    - Advantages: Small output size, Collision risk elimination, simple implementation, quick deployment
    - Disadvantages: using a uuid library may increase server load when app scales, security concerns with conversion pattern
  - **Decision:** Unique ID Generator + Base 62 Conversion

- **Database Selection**:
  - **Option 1: SQL Database**
    - Advantages: Security, scalability, mature ecosystem, complex queries
    - Disadvantages: Rigid schema, scaling challenges, data repetition
  - **Option 2: NoSQL Database**
    - Advantages: Performance, scalability, flexible schema, efficient analytics and optimized query and storage with MongoDB's time-series collection
    - Disadvantages: Less mature ecosystem, limited query capabilities
  - **Decision:** NoSQL Database (MongoDB)

- **Programming Languages, Libraries, and Frameworks**:
  - Team Experience: Proficiency in TypeScript/JavaScript
    - Advantage: Quickens development process
    - Maintainability: TypeScript's complexity is offset by long-term benefits
  - **Decision:** TypeScript, Node.js, and Express

## API Architecture

- **Type**: RESTful
- **Endpoints**:
  - **URL Router** `/api/v1/url`
    - **Shorten URL** `POST /shorten`
      - **Request Body:**
        ```json
        {
          "longUrl": "https://www.google.com"
        }
      - **Response:**
          - **Status Code:** 201 Created
          - **Body:**
          ```json
        {
          "shortUrl": "https://www.shorturl.com/Ev"
        }
    - **Redirect URL**: `GET /:shortUrlId`
      - **Request Path Params:**
          - `shortUrlId` (e.g., `/H3`)
      - **Response:**
          - **Status Code:** 301 Permanent Redirect
          - **Header:** *{Location: https://www.google.com}*

    - **URL Analytics**: `GET /analytics`
      - **Request Query Params:**
          - `shortUrlId`
          - `timeFrame` (24h, 7d, or all *Default to all if not provided)
          - Example: `/analytics?shortUrlId=H3&timeFrame=24h`
      - **Response:**
          - **Status Code:** 200 OK
          - **Body:**
          ```json
        {
          "timeFrame": "24h",
          "accessCount": 13
        }

## Database

### URLs Collection
```javascript
const ShortUrlSchema = new Schema({
  shortUrlId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

const UrlSchema = new Schema({
  longUrl: { type: String, required: true },
  shortUrls: [ShortUrlSchema],
  createdAt: { type: Date, required: true, default: Date.now },
});
```
### Access Logs Collection (Time Series)
```javascript
const AccessLogSchema = new Schema({
  accessTime: { type: Date, required: true, default: Date.now },
  shortUrlId: { type: String, required: true },
  timeseries: {
    timeField: 'accessTime',
    metaField: 'shortUrlId',
    granularity: 'seconds',
  },
});
```

## Stretch Goals

### Maintainability

- **Comprehensive Testing:** Increase unit and integration tests to ensure code changes do not break existing functionality.

### Performance

- **Caching Strategy:** Implement an in-memory caching layer using Redis to store and quickly retrieve high-traffic URLs and pre-aggregated analytics data, with regular updates and TTL policies (e.g.1 hour) ensuring data freshness and reduced database queries for enhanced performance.
- **Load Balancing:** Use load balancers to distribute traffic evenly across servers, preventing any single server from becoming a bottleneck.

### Security

- **Data Sanitization:** Employ stricter input validation and sanitization middlewares to protect against SQL injection, XSS, and other injection attacks.
- **Error Response Standardization:** Establish a standard error response format across the api including a consistent structure for sending error codes, messages, and field-specific validation errors.

### Availability

- **Redundancy:** Deploy the application across multiple data centers to ensure availability in the event of a data center failure.

### Scalability

- **Database Sharding:** Implement database sharding to distribute data across multiple databases, improving read/write performance as the dataset grows.
- **Custom Middlewares:** Implement custom middlewares and functions to replace external libraries such as uuid, express rate limit etc when app scales to reduce overhead
