from urllib.parse import urlparse
import logging


def extract_platform(url):
    """
    Extracts the root domain from a given URL.
    Example: 'https://www.instagram.com/p/123' -> 'instagram.com'
    """
    try:
        if not url:
            return 'Web'

        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()

        # Remove 'www.' to keep the platform name clean
        if domain.startswith('www.'):
            domain = domain[4:]

        return domain if domain else 'Web'
    except Exception as e:
        logging.warning(f"Failed to extract domain from {url}: {e}")
        return 'Web'