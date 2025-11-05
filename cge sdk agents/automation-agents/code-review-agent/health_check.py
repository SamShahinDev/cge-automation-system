#!/usr/bin/env python3
"""
Health check script for Code Review Agent
Validates configuration and dependencies
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import yaml

# Load environment
load_dotenv()


def check_python_version():
    """Check Python version"""
    required_version = (3, 9)
    current_version = sys.version_info[:2]

    if current_version < required_version:
        return False, f"Python {required_version[0]}.{required_version[1]}+ required, found {current_version[0]}.{current_version[1]}"
    return True, f"Python {current_version[0]}.{current_version[1]} ✓"


def check_dependencies():
    """Check required dependencies"""
    required_packages = [
        'anthropic',
        'yaml',
        'dotenv',
        'tenacity',
        'structlog',
        'colorama',
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package if package != 'dotenv' else 'dotenv')
        except ImportError:
            missing.append(package)

    if missing:
        return False, f"Missing packages: {', '.join(missing)}"
    return True, "All dependencies installed ✓"


def check_api_key():
    """Check Anthropic API key"""
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        return False, "ANTHROPIC_API_KEY not found in environment"

    if not api_key.startswith("sk-"):
        return False, "ANTHROPIC_API_KEY appears to be invalid"

    return True, "API key configured ✓"


def check_config_file():
    """Check configuration file"""
    config_path = Path(__file__).parent / "config.yaml"

    if not config_path.exists():
        return False, "config.yaml not found"

    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)

        required_fields = ['project_types', 'auto_fix_enabled', 'report_format']
        missing_fields = [field for field in required_fields if field not in config]

        if missing_fields:
            return False, f"Missing config fields: {', '.join(missing_fields)}"

        return True, "Configuration file valid ✓"

    except Exception as e:
        return False, f"Error loading config: {e}"


def check_write_permissions():
    """Check write permissions"""
    test_file = Path("test_write_permission.tmp")

    try:
        with open(test_file, 'w') as f:
            f.write("test")
        test_file.unlink()
        return True, "Write permissions OK ✓"
    except Exception as e:
        return False, f"Write permission error: {e}"


def main():
    """Run all health checks"""
    print("🏥 Code Review Agent Health Check\n")

    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("API Key", check_api_key),
        ("Configuration", check_config_file),
        ("Write Permissions", check_write_permissions),
    ]

    all_passed = True

    for name, check_func in checks:
        try:
            passed, message = check_func()
            status = "✅" if passed else "❌"
            print(f"{status} {name}: {message}")

            if not passed:
                all_passed = False

        except Exception as e:
            print(f"❌ {name}: Unexpected error - {e}")
            all_passed = False

    print("\n" + "="*50)

    if all_passed:
        print("✅ All health checks passed! Agent is ready to use.")
        return 0
    else:
        print("❌ Some health checks failed. Please fix the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
