from playwright.async_api import async_playwright
import re

class ScraperService:
    @staticmethod
    async def scrape_url(url: str) -> str:
        """Asynchronously scrapes the visible text content of a URL using Playwright."""
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        try:
            async with async_playwright() as p:
                # Launch headless browser instance
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(ignore_https_errors=True)
                page = await context.new_page()
                
                print(f"Scraping URL: {url}")
                # Set a reasonable timeout of 15 seconds
                await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                
                # Extract text content from the body element
                body_text = await page.locator("body").inner_text()
                
                await browser.close()
                
                # Clean up multiple whitespaces, tabs, and duplicate newlines
                cleaned_text = re.sub(r'\n+', '\n', body_text)
                cleaned_text = re.sub(r'[ \t]+', ' ', cleaned_text)
                
                # Limit content size to prevent prompt token bloat (approx. 2500 words)
                words = cleaned_text.split()
                if len(words) > 2500:
                    cleaned_text = " ".join(words[:2500]) + "\n... [Content Truncated]"
                    
                return cleaned_text.strip()
        except Exception as e:
            print(f"Scraper Error for {url}: {e}")
            return f"Error occurred while scraping {url}: {str(e)}"
