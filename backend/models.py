"""
Data models for the multilingual KB platform
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Article(BaseModel):
    """Article model for knowledge base"""
    id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    language: str = Field(..., min_length=2, max_length=5)
    category: str = Field(..., min_length=1, max_length=100)
    author: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tags: Optional[list] = []

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "title": "Getting Started",
                "content": "Learn how to use the platform...",
                "language": "en",
                "category": "Tutorials",
                "author": "Admin",
                "tags": ["beginner", "tutorial"]
            }
        }


class Language(BaseModel):
    """Language model"""
    code: str = Field(..., min_length=2, max_length=5)
    name: str = Field(..., min_length=1, max_length=100)
    is_active: bool = True


class Category(BaseModel):
    """Article category model"""
    id: Optional[int] = None
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class SearchResult(BaseModel):
    """Search result model"""
    total_results: int
    articles: list[Article]
    query: str
    language: str


class User(BaseModel):
    """User model"""
    id: Optional[int] = None
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    is_active: bool = True
    created_at: Optional[datetime] = None
