# Blink-r API

## Overview

Blink-r API makes your long links short and easy to share! It's perfect for simplifying long URLs into neat, manageable links that you can track with our easy-to-understand analytics.

## Features

- **URL Shortening**: Convert lengthy URLs into short, memorable links in seconds.
- **URL Redirection**: Redirect from short URLs to their original long URLs.
- **Analytics Tracking**: Access statistics on short URL access, with data available for 24 hours, 7 days, and all time.
- **High Performance and Scalability**: Designed to handle high traffic volumes and scale efficiently as the app grows.
- **Secure & Reliable**: Utilized Helmet for setting various HTTP headers to protect against common vulnerabilities and rate limiting to prevent DDoS attacks.
- **Continuous Improvements**: Leveraged a CI/CD pipeline for ongoing testing and deployment, ensuring the app evolves with regular updates and optimizations.

## Design Document

For an in-depth look at the system design, including architecture decisions, database schema, and scalability considerations, please see the [System Design Document](./SYSTEM_DESIGN_DOC.md).

## Getting Started

### Using the API with `curl`

Make sure to replace placeholders like `<full-long-url>`, `<short-url-id>`, and `<time-frame>` with actual values when using these commands.

### Shorten URL
To shorten a long URL, use the following command:
```bash
curl -X POST https://blink-r-api.onrender.com/api/v1/url/shorten -H "Content-Type: application/json" -d '{"longUrl": <full-long-url>}'
```
Example:
```bash
curl -X POST https://blink-r-api.onrender.com/api/v1/url/shorten -H "Content-Type: application/json" -d '{"longUrl": "https://www.google.com"}'
```

### Redirect URL
To redirect to the original URL using a short URL ID, use the following command:
```bash
curl -L -i https://blink-r-api.onrender.com/api/v1/url/<short-url-id>
```
Example:
```bash
curl -L -i https://blink-r-api.onrender.com/api/v1/url/H3
```

### URL Analytics
To retrieve analytics for a short URL, specify the short URL ID and the timeframe for the analytics:
```bash
curl -X GET "https://blink-r-api.onrender.com/api/v1/url/analytics?shortUrlId=<short-url-id>&timeFrame=<time-frame>"
```
Example:
```bash
curl -X GET "https://short-url-api-kinski.onrender.com/api/v1/url/analytics?shortUrlId=H3&timeFrame=24h"
```
