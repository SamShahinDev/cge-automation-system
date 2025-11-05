"""
Custom exceptions for Code Review Agent
"""


class CodeReviewError(Exception):
    """Base exception for code review errors"""
    pass


class ConfigurationError(CodeReviewError):
    """Raised when configuration is invalid"""
    pass


class ProjectNotFoundError(CodeReviewError):
    """Raised when project path doesn't exist"""
    pass


class InvalidProjectTypeError(CodeReviewError):
    """Raised when project type is not supported"""
    pass


class APIError(CodeReviewError):
    """Raised when external API calls fail"""
    pass


class FileAnalysisError(CodeReviewError):
    """Raised when file analysis fails"""
    pass


class ReportGenerationError(CodeReviewError):
    """Raised when report generation fails"""
    pass


class AutoFixError(CodeReviewError):
    """Raised when auto-fix operation fails"""
    pass
