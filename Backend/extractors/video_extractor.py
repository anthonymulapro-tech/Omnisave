import yt_dlp
from .base_extractor import BaseExtractor


class VideoExtractor(BaseExtractor):
    def __init__(self):
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'skip_download': True,
        }

    def extract_data(self, url):
        """
        Extracts metadata, title, and description from a video URL.
        """
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

                title = info.get('title', '')
                description = info.get('description', '')

                # --- NEW: Extracting author and thumbnail ---
                # Fallback to 'channel' if 'uploader' is missing
                author = info.get('uploader', info.get('channel', 'Unknown Creator'))
                thumbnail = info.get('thumbnail', None)

                full_text = f"{title}. {description}"

                print(f"Extraction successful for: {title} by {author}")

                # Return a complete dictionary of metadata
                return {
                    "text": full_text,
                    "author": author,
                    "title": title if title else f"Video by {author}",
                    "thumbnail_url": thumbnail
                }

        except Exception as e:
            print(f"Error during video extraction for {url} : {str(e)}")
            return None