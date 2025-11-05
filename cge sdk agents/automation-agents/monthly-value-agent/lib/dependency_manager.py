"""Dependency management and update module"""

import json
import asyncio
import semver
import requests
from typing import List, Dict, Any
from pathlib import Path


class DependencyManager:
    """Manages dependency analysis and updates"""

    async def get_dependencies(self) -> Dict[str, str]:
        """
        Get current dependencies from package.json

        Returns:
            Dictionary of dependencies and versions
        """
        dependencies = {}

        try:
            package_json = Path('package.json')
            if package_json.exists():
                with open(package_json, 'r') as f:
                    data = json.load(f)
                    dependencies.update(data.get('dependencies', {}))
                    dependencies.update(data.get('devDependencies', {}))

        except Exception as e:
            print(f"Error reading dependencies: {e}")

        return dependencies

    async def check_updates(self) -> List[Dict[str, Any]]:
        """
        Check for available updates

        Returns:
            List of available updates
        """
        updates = []

        dependencies = await self.get_dependencies()

        for name, version in dependencies.items():
            try:
                # Check npm registry for latest version
                latest = await self._get_latest_version(name)

                if latest and self._is_newer(latest, version):
                    updates.append({
                        'name': name,
                        'current_version': version,
                        'latest_version': latest,
                        'type': self._get_update_type(version, latest)
                    })

            except Exception as e:
                print(f"Error checking {name}: {e}")
                continue

        return updates

    async def _get_latest_version(self, package: str) -> str:
        """Get latest version from npm registry"""
        try:
            response = requests.get(
                f"https://registry.npmjs.org/{package}/latest",
                timeout=5
            )
            if response.status_code == 200:
                return response.json().get('version')
        except:
            pass
        return None

    def _is_newer(self, latest: str, current: str) -> bool:
        """Compare versions"""
        try:
            # Clean version strings
            latest_clean = latest.lstrip('^~')
            current_clean = current.lstrip('^~')

            return semver.compare(latest_clean, current_clean) > 0
        except:
            return False

    def _get_update_type(self, current: str, latest: str) -> str:
        """Determine update type (major, minor, patch)"""
        try:
            current_clean = current.lstrip('^~')
            latest_clean = latest.lstrip('^~')

            current_ver = semver.VersionInfo.parse(current_clean)
            latest_ver = semver.VersionInfo.parse(latest_clean)

            if latest_ver.major > current_ver.major:
                return 'major'
            elif latest_ver.minor > current_ver.minor:
                return 'minor'
            else:
                return 'patch'
        except:
            return 'unknown'

    async def identify_breaking_changes(
        self,
        updates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Identify updates with potential breaking changes"""
        breaking = []

        for update in updates:
            if update['type'] == 'major':
                breaking.append({
                    **update,
                    'reason': 'Major version update may include breaking changes'
                })

        return breaking

    async def calculate_safety_scores(
        self,
        updates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Calculate safety score for each update (1-10)"""
        scored = []

        for update in updates:
            score = 10  # Start with perfect score

            # Deduct for update type
            if update['type'] == 'major':
                score -= 4
            elif update['type'] == 'minor':
                score -= 2
            elif update['type'] == 'patch':
                score -= 1

            # Add metadata
            scored.append({
                **update,
                'score': max(1, score),
                'recommendation': self._get_recommendation(score)
            })

        return scored

    def _get_recommendation(self, score: int) -> str:
        """Get recommendation based on safety score"""
        if score >= 8:
            return 'Safe to auto-update'
        elif score >= 6:
            return 'Review and test before updating'
        else:
            return 'Requires careful review and testing'
