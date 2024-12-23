# Crawler for Discovering Product URLs on E-commerce Websites

This project implements a web crawler that extracts URLs from a given list of domains, identifies potential product pages based on specific characteristics, and saves the results in a JSON file. It uses **Puppeteer** for dynamic webpage rendering, **Cheerio** for HTML parsing, and **Node.js**'s `fs` module for file handling.

## Features

-   Extracts links from web pages and dynamically renders content using Puppeteer.
-   Identifies product pages by searching for specific HTML elements and attributes.
-   Filters extracted URLs to isolate product pages.
-   Saves the results to a `JSON` file for further processing.

## Prerequisites

Before running the project, ensure you have the following installed:

-   **Node.js** (version 16 or above recommended)
-   **npm** or **yarn** package manager

## Installation

1. Clone the repository or copy the project files to your local machine.
2. Navigate to the project directory in your terminal.
3. Install dependencies by running:

    ```bash
    npm install Puppeteer Cheerio fs
    ```

## Usage

Edit the domains array at the end of the script to include the target websites:
const domains = [
"https://www.example.com",
// Add more domains as needed
];

run this in node index.js
Extract and process URLs from the specified domains.
Identify product pages.
Saves the results to a `JSON` file for further processing.

### Dependencies

Puppeteer - Headless Chrome browser for dynamic content rendering.
Cheerio - Server-side HTML parsing and manipulation.
Node.js - JavaScript runtime for executing the script.

### Notes

Performance: The script processes URLs in batches to reduce memory usage and prevent overwhelming system resources.
Dynamic Content: Only supports dynamic content fetching when usePuppeteer is set to true.
Error Handling: Errors during fetching or URL processing are logged but do not stop the script from running.
Limitations
The script may be blocked by websites with anti-scraping mechanisms.
Ensure compliance with the terms of service of the websites being crawled.

### Legal Disclaimer

This project is intended for educational and lawful use. Ensure you have permission to scrape the target websites and comply with their terms of service. The author is not responsible for any misuse.
