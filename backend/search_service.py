from playwright.async_api import async_playwright
import urllib.parse
from scraper_service import ScraperService

class SearchService:
    @staticmethod
    async def search_and_scrape(query: str, limit: int = 3) -> str:
        """Searches DuckDuckGo, extracts top result URLs, and scrapes them."""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(ignore_https_errors=True)
                page = await context.new_page()
                
                search_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
                print(f"Searching DuckDuckGo: {search_url}")
                await page.goto(search_url, wait_until="domcontentloaded", timeout=15000)
                
                # DuckDuckGo HTML results list
                locators = await page.locator("a.result__snippet").all()
                urls = []
                for loc in locators:
                    href = await loc.get_attribute("href")
                    if href:
                        if "uddg=" in href:
                            actual_url = href.split("uddg=")[1].split("&")[0]
                            href = urllib.parse.unquote(actual_url)
                        if href.startswith("http") and "duckduckgo.com" not in href:
                            urls.append(href)
                            if len(urls) >= limit:
                                break
                                
                await browser.close()
                
            if not urls:
                return "No search results found on the web."
                
            print(f"Web search yielded URLs: {urls}")
            scraped_contents = []
            for url in urls:
                try:
                    content = await ScraperService.scrape_url(url)
                    # Keep first 800 words of each page
                    words = content.split()
                    truncated_content = " ".join(words[:800])
                    scraped_contents.append(f"--- URL SOURCE: {url} ---\n{truncated_content}\n")
                except Exception as scrape_err:
                    print(f"Failed to scrape search result {url}: {scrape_err}")
                
            return "\n".join(scraped_contents)
        except Exception as e:
            print(f"Search Service Error: {e}")
            return f"Failed to perform web search: {str(e)}"
