"""
Structured logging configuration for Code Review Agent
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime
import structlog
from structlog.processors import JSONRenderer
from colorama import init, Fore, Style

# Initialize colorama for cross-platform colored output
init(autoreset=True)


class ColoredConsoleRenderer:
    """Custom renderer for colored console output"""

    LEVEL_COLORS = {
        "debug": Fore.CYAN,
        "info": Fore.GREEN,
        "warning": Fore.YELLOW,
        "error": Fore.RED,
        "critical": Fore.RED + Style.BRIGHT,
    }

    def __call__(self, logger, method_name, event_dict):
        level = event_dict.get("level", "info")
        color = self.LEVEL_COLORS.get(level, "")
        timestamp = event_dict.pop("timestamp", "")
        event = event_dict.pop("event", "")

        # Format the log message
        message = f"{Fore.WHITE}{timestamp}{Style.RESET_ALL} "
        message += f"{color}[{level.upper()}]{Style.RESET_ALL} "
        message += f"{event}"

        # Add context fields
        if event_dict:
            context_items = [f"{k}={v}" for k, v in event_dict.items()
                           if k not in ["logger", "level", "timestamp", "event"]]
            if context_items:
                message += f" {Fore.BLUE}{' '.join(context_items)}{Style.RESET_ALL}"

        return message


def setup_logging(log_level: str = "INFO", log_file: str = None, enable_sentry: bool = False):
    """
    Setup structured logging

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path to write logs
        enable_sentry: Enable Sentry error tracking
    """

    # Configure Sentry if enabled
    if enable_sentry and os.getenv("SENTRY_DSN"):
        import sentry_sdk
        sentry_sdk.init(
            dsn=os.getenv("SENTRY_DSN"),
            environment=os.getenv("ENVIRONMENT", "development"),
            traces_sample_rate=0.1,
            profiles_sample_rate=0.1,
        )

    # Determine if we're in CI environment
    is_ci = os.getenv("CI", "false").lower() == "true"

    # Setup processors
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # Use JSON in CI, colored output locally
    if is_ci or log_file:
        processors = shared_processors + [JSONRenderer()]
    else:
        processors = shared_processors + [ColoredConsoleRenderer()]

    # Configure structlog
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level.upper()),
    )

    # Add file handler if specified
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, log_level.upper()))

        # Use JSON format for file logs
        file_formatter = logging.Formatter('%(message)s')
        file_handler.setFormatter(file_formatter)

        root_logger = logging.getLogger()
        root_logger.addHandler(file_handler)

    return structlog.get_logger()


def get_logger(name: str = None):
    """Get a logger instance"""
    return structlog.get_logger(name)
