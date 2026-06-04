"""
Business logic services for the multilingual KB platform
"""

from typing import List, Optional
from models import Article, Language


class ArticleService:
    """Service for managing articles"""

    def __init__(self):
        self.articles: List[Article] = []
        self.next_id = 1

    def create_article(self, title: str, content: str, language: str, category: str) -> Article:
        """Create a new article"""
        article = Article(
            id=self.next_id,
            title=title,
            content=content,
            language=language,
            category=category
        )
        self.articles.append(article)
        self.next_id += 1
        return article

    def get_article(self, article_id: int) -> Optional[Article]:
        """Retrieve an article by ID"""
        for article in self.articles:
            if article.id == article_id:
                return article
        return None

    def get_articles_by_language(self, language: str) -> List[Article]:
        """Get all articles in a specific language"""
        return [a for a in self.articles if a.language == language]

    def search_articles(self, query: str, language: str) -> List[Article]:
        """Search articles by query and language"""
        results = []
        query_lower = query.lower()
        for article in self.articles:
            if article.language == language:
                if query_lower in article.title.lower() or query_lower in article.content.lower():
                    results.append(article)
        return results

    def update_article(self, article_id: int, title: str, content: str, category: str) -> Optional[Article]:
        """Update an existing article"""
        article = self.get_article(article_id)
        if article:
            article.title = title
            article.content = content
            article.category = category
        return article

    def delete_article(self, article_id: int) -> bool:
        """Delete an article by ID"""
        for i, article in enumerate(self.articles):
            if article.id == article_id:
                self.articles.pop(i)
                return True
        return False


class LanguageService:
    """Service for managing supported languages"""

    SUPPORTED_LANGUAGES = {
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "zh": "Chinese",
        "ja": "Japanese",
        "pt": "Portuguese",
        "ru": "Russian",
    }

    @classmethod
    def get_supported_languages(cls) -> dict:
        """Get all supported languages"""
        return cls.SUPPORTED_LANGUAGES

    @classmethod
    def is_language_supported(cls, language_code: str) -> bool:
        """Check if a language is supported"""
        return language_code in cls.SUPPORTED_LANGUAGES
