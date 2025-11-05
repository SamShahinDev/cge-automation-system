"""
Context Manager
Intelligently loads project context for prompt enhancement
"""

import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import json

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class ContextManager:
    """
    Manages project context loading

    Features:
    - Smart file selection based on hints
    - Project structure analysis
    - Configuration detection
    - Dependency analysis
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.max_files = config.get('context', {}).get('max_files', 10)
        self.max_file_size = config.get('context', {}).get('max_file_size_kb', 100) * 1024

    async def load_context(
        self,
        project_path: str,
        hints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Load project context

        Args:
            project_path: Path to project directory
            hints: Optional hints for context loading

        Returns:
            Project context dictionary
        """
        logger.info(f"Loading context for: {project_path}")

        project_dir = Path(project_path)

        if not project_dir.exists():
            raise ValueError(f"Project path does not exist: {project_path}")

        context = {
            'project_path': str(project_dir),
            'project': self._analyze_project(project_dir),
            'files': await self._select_relevant_files(project_dir, hints),
            'config_files': self._find_config_files(project_dir)
        }

        logger.info(f"Loaded context with {len(context['files'])} files")

        return context

    def _analyze_project(self, project_dir: Path) -> Dict[str, Any]:
        """Analyze project structure and type"""

        project_info = {
            'name': project_dir.name,
            'type': 'unknown',
            'framework': 'unknown',
            'primary_language': 'unknown'
        }

        # Detect project type
        if (project_dir / 'package.json').exists():
            project_info['type'] = 'node'
            project_info['primary_language'] = 'javascript'

            # Check for frameworks
            try:
                with open(project_dir / 'package.json', 'r') as f:
                    package = json.load(f)
                    deps = {**package.get('dependencies', {}), **package.get('devDependencies', {})}

                    if 'next' in deps:
                        project_info['framework'] = 'next.js'
                    elif 'react' in deps:
                        project_info['framework'] = 'react'
                    elif 'vue' in deps:
                        project_info['framework'] = 'vue'
            except Exception as e:
                logger.warning(f"Failed to parse package.json: {e}")

        elif (project_dir / 'requirements.txt').exists() or (project_dir / 'setup.py').exists():
            project_info['type'] = 'python'
            project_info['primary_language'] = 'python'

            # Check for frameworks
            if (project_dir / 'manage.py').exists():
                project_info['framework'] = 'django'
            elif any(project_dir.rglob('app.py')):
                project_info['framework'] = 'flask'

        elif (project_dir / 'Cargo.toml').exists():
            project_info['type'] = 'rust'
            project_info['primary_language'] = 'rust'

        elif (project_dir / 'go.mod').exists():
            project_info['type'] = 'go'
            project_info['primary_language'] = 'go'

        return project_info

    async def _select_relevant_files(
        self,
        project_dir: Path,
        hints: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Select most relevant files for context

        Priority:
        1. Files mentioned in hints
        2. README, documentation
        3. Main entry points
        4. Configuration files
        5. Recently modified files
        """

        selected_files = []

        # Priority files
        priority_patterns = [
            'README.md',
            'README.txt',
            'ARCHITECTURE.md',
            'DESIGN.md',
            'src/index.*',
            'src/main.*',
            'app.py',
            'main.py',
            'index.js',
            'index.ts',
        ]

        # Find priority files
        for pattern in priority_patterns:
            matches = list(project_dir.rglob(pattern))
            for match in matches:
                if self._should_include_file(match):
                    selected_files.append(self._file_info(match, project_dir))

        # Add files from hints
        if hints and 'focus_files' in hints:
            for file_path in hints['focus_files']:
                full_path = project_dir / file_path
                if full_path.exists() and self._should_include_file(full_path):
                    selected_files.append(self._file_info(full_path, project_dir))

        # Limit to max_files
        return selected_files[:self.max_files]

    def _find_config_files(self, project_dir: Path) -> List[str]:
        """Find configuration files"""

        config_patterns = [
            'package.json',
            'tsconfig.json',
            'next.config.*',
            '.env.example',
            'requirements.txt',
            'Cargo.toml',
            'go.mod'
        ]

        config_files = []

        for pattern in config_patterns:
            matches = list(project_dir.rglob(pattern))
            for match in matches:
                if match.is_file():
                    config_files.append(str(match.relative_to(project_dir)))

        return config_files

    def _should_include_file(self, file_path: Path) -> bool:
        """Check if file should be included in context"""

        # Skip hidden files
        if any(part.startswith('.') for part in file_path.parts):
            if not file_path.name.startswith('.env'):  # Allow .env.example
                return False

        # Skip if too large
        if file_path.stat().st_size > self.max_file_size:
            return False

        # Skip binary files
        binary_extensions = {'.pyc', '.so', '.dll', '.exe', '.bin', '.png', '.jpg', '.gif'}
        if file_path.suffix in binary_extensions:
            return False

        return True

    def _file_info(self, file_path: Path, project_dir: Path) -> Dict[str, Any]:
        """Get file information"""

        relative_path = file_path.relative_to(project_dir)

        # Read first few lines as summary
        summary = ""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = [next(f) for _ in range(5)]
                summary = ''.join(lines).strip()
        except Exception:
            pass

        return {
            'path': str(relative_path),
            'full_path': str(file_path),
            'size_bytes': file_path.stat().st_size,
            'extension': file_path.suffix,
            'summary': summary
        }
