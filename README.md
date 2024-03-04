# Short URL API System

## Overview

The Short URL API is a robust and secure system designed for URL shortening, redirection, and comprehensive analytics tracking. It transforms long URLs into manageable, short links, facilitates quick redirects, and provides detailed access analytics. This API is built on a scalable architecture that ensures very low latency, supports millions of URLs, and maintains data persistency. To enhance security and ensure the reliability of the service, the system incorporates middleware such as Helmet for security headers and rate limiting to prevent abuse. Additionally, it adopts a CI/CD pipeline for automated testing and deployment, ensuring continuous integration and delivery of new features and fixes.

## Key Features

- **URL Shortening**: Convert long URLs into short, unique URLs.
- **URL Redirection**: Redirect users from short URLs to their original long URLs.
- **Analytics Tracking**: Provide statistics on URL access frequency over 24 hours, 7 days, and all time.
- **High Performance and Scalability:**: Designed to handle high traffic volumes and scale efficiently when the app grows.
- **Enhanced Security**: Utilize Helmet for setting various HTTP headers to protect against common vulnerabilities and rate limiting to prevent DDoS attacks.
- **CI/CD Pipeline**: Automated testing and deployment pipeline to ensure code quality and rapid iteration.

## Design Document

For an in-depth look at the system design, including architecture decisions, database schema, and scalability considerations, please see the [System Design Document](./SYSTEM_DESIGN_DOC.md).

## Getting Started

### Using the API with `curl`

Make sure to replace placeholders like `<full-long-url>`, `<short-url-id>`, and `<time-frame>` with actual values when using these commands.

### Shorten URL
To shorten a long URL, use the following command:
```bash
curl -X POST https://short-url-api-kinski.onrender.com/api/v1/url/shorten -H "Content-Type: application/json" -d '{"longUrl": <full-long-url>}'
```
Example:
```bash
curl -X POST https://short-url-api-kinski.onrender.com/api/v1/url/shorten -H "Content-Type: application/json" -d '{"longUrl": "https://www.google.com"}'
```

### Redirect URL
To redirect to the original URL using a short URL ID, use the following command:
```bash
curl -L -i https://short-url-api-kinski.onrender.com/api/v1/url/<short-url-id>
```
Example:
```bash
curl -L -i https://short-url-api-kinski.onrender.com/api/v1/url/H3
```

### URL Analytics
To retrieve analytics for a short URL, specify the short URL ID and the timeframe for the analytics:
```bash
curl -X GET "https://short-url-api-kinski.onrender.com/api/v1/url/analytics?shortUrlId=<short-url-id>&timeFrame=<time-frame>"
```
Example:
```bash
curl -X GET "https://short-url-api-kinski.onrender.com/api/v1/url/analytics?shortUrlId=H3&timeFrame=24h"
```
