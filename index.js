import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import fs from "fs/promises";

async function fetchHtmlEnhanced(url, usePuppeteer = false) {
    try {
        if (usePuppeteer) {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

            await page.goto(url, { waitUntil: "domcontentloaded" });
            const html = await page.content();

            await browser.close();
            console.log(`fetching HTML ${html} from ${url}`);
            return html;
        } else {
            throw new Error("Non-Puppeteer fetch disabled for dynamic sites.");
        }
    } catch (error) {
        console.error(`Error fetching HTML from ${url}: ${error.message}`);
        return null;
    }
}

function extractUrlsFromHtml(domain, html, domainPatterns) {
    const $ = cheerio.load(html);
    const rawUrls = new Set();

    $("a").each((index, element) => {
        const link = $(element).attr("href");
        if (link && domainPatterns.some((pattern) => link.includes(pattern))) {
            try {
                const absoluteUrl = new URL(link, domain).href;
                rawUrls.add(absoluteUrl);
            } catch (err) {
                console.warn(`Invalid URL skipped: ${link}`);
            }
        }
    });

    return Array.from(rawUrls);
}

// Function to verify if a given URL corresponds to a product page
async function verifyProductPage(url) {
    try {
        const html = await fetchHtmlEnhanced(url, true);

        if (!html) return false;

        const $ = cheerio.load(html);

        const selectors = [
            'button[title*="Buy Now"]',
            "span#title",
            "span#productTitle",
            'button:contains("Add to Basket")',
            'button:contains("NOTIFY ME")',
            'button:contains("Buy It Now")',
            'button:contains("Add to Cart")',
            'button:contains("Buy Now")',
            'button[aria-label*="Add to Cart"]',
            'button[aria-label*="Buy Now"]',
            'span[class*="price"]',
            'div[id*="price"]',
            'meta[name="description"]',
            'meta[name="keywords"]',
        ];

        for (const selector of selectors) {
            if ($(selector).length > 0) {
                return true;
            }
        }
        return (
            $('img[id*="product-image"]').length > 0 &&
            $('h1[class*="product-title"]').length > 0
        );
    } catch (error) {
        console.error(`Error verifying product page ${url}: ${error.message}`);
        return false;
    }
}

// Function to filter a list of URLs to find product pages
async function filterProductUrls(urls, domain) {
    const filteredUrls = [];
    const failedUrls = [];

    const batchSize = 10;

    // Process URLs in smaller batches to reduce memory usage and system strain.
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);

        const results = await Promise.all(
            batch.map(async (url) => {
                const isProduct = await verifyProductPage(url);
                return { url, isProduct };
            })
        );

        results.forEach(({ url, isProduct }) => {
            if (isProduct) {
                filteredUrls.push(url);
            } else {
                failedUrls.push(url);
            }
        });
    }

    // Uncomment this section if you want to save failed URLs to a JSON file.
    /*
    await fs.writeFile(
        "failed.json", // File name for storing failed URLs.
        JSON.stringify({ domain, failedUrls }, null, 2), // JSON content (pretty-printed).
        "utf-8" // File encoding.
    );
    */

    return filteredUrls;
}

async function crawler(domain) {
    console.log(`Starting crawler for: ${domain}`);

    const html = await fetchHtmlEnhanced(domain, true);

    if (!html) {
        console.warn(`Failed to fetch HTML for ${domain}`);
        return { domain, productUrls: [] };
    }

    const domainPatterns = [
        "/product/",
        "/item/",
        "/itm/",
        "/p/",
        "/ip/",
        "/pl/",
        "/p-",
        "/dp/",
        "/gp/",
        "/products/",
        "/buy/",
    ];
    const extractedUrls = extractUrlsFromHtml(domain, html, domainPatterns);
    console.log(`Extracted ${extractedUrls.length} URLs from ${domain}`);

    // insted of all extractedUrls we can iterate through 5 urls to get PRODUCT page urls
    const additionalUrls = [];
    for (const url2 of extractedUrls.slice(0, 5)) {
        const html2 = await fetchHtmlEnhanced(url2, true);
        if (!html2) continue;
        const extractedUrls2 = extractUrlsFromHtml(url2, html2, domainPatterns);
        console.log(
            `Additional Extracted ${extractedUrls2.length} URLs from ${url2}`
        );

        additionalUrls.push(...extractedUrls2);
    }

    const allUrls = [...new Set([...extractedUrls, ...additionalUrls])];

    console.log(`All Extracted ${allUrls.length} URLs from ${domain}`);

    const productUrls = await filterProductUrls(allUrls, domain);
    console.log(
        `ALl Filtered ${productUrls.length} product URLs for ${domain}`
    );

    return { domain, productUrls };
}

const domains = [
    "https://www.ecommerswebsite1.com",
    "https://www.ecommerswebsite2.com",
    "https://www.example3.com",
];

const Main = async () => {
    const results = await Promise.all(domains.map(crawler));
    const output = results.map(({ domain, productUrls }) => ({
        domain,
        productUrls,
    }));

    await fs.writeFile("output.json", JSON.stringify(output, null, 2), "utf-8");
    console.log("Crawling complete. Results saved to output.json");
};

Main();
