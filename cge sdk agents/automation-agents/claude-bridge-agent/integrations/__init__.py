"""Integration modules for Claude Bridge Agent"""

from .batch_processor import BatchProcessor, Feature
from .post_execution import PostExecutionHandler

__all__ = ['BatchProcessor', 'Feature', 'PostExecutionHandler']
