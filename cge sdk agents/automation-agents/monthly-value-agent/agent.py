#!/usr/bin/env python3
"""
Monthly Value-Add Agent for Crowned Gladiator Enterprises
Demonstrates ongoing value to justify subscription model
"""

import os
import sys
import asyncio
import traceback
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import yaml
import json
from dotenv import load_dotenv
from anthropic import Anthropic

# Add parent directory to path for shared modules
sys.path.append(str(Path(__file__).parent.parent / "code-review-agent"))
from logger import setup_logging, get_logger
from exceptions import ConfigurationError

# Load environment
load_dotenv()

# Setup logging
logger = setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    log_file=os.getenv("LOG_FILE"),
    enable_sentry=os.getenv("ENABLE_SENTRY", "false").lower() == "true"
)

from lib.database_analyzer import DatabaseAnalyzer
from lib.security_auditor import SecurityAuditor
from lib.dependency_manager import DependencyManager
from lib.usage_analyzer import UsageAnalyzer
from lib.report_generator import ReportGenerator
from lib.github_manager import GitHubManager


class MonthlyValueAgent:
    """
    Monthly Value-Add Agent

    Runs comprehensive analysis and optimization for client projects
    to demonstrate ongoing value and justify subscription model.
    """

    def __init__(self, client_name: str):
        """
        Initialize the Monthly Value Agent

        Args:
            client_name: Name of the client to analyze
        """
        logger.info("Initializing Monthly Value Agent", client=client_name)

        self.client_name = client_name
        self.run_date = datetime.now()

        # Load configuration
        self.config = self._load_config()
        self.client_config = self.config['clients'].get(client_name)

        if not self.client_config:
            raise ConfigurationError(f"Client '{client_name}' not found in configuration")

        # Initialize Anthropic
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ConfigurationError("ANTHROPIC_API_KEY required")

        self.client = Anthropic(api_key=api_key)

        # Initialize analyzers
        self.db_analyzer = DatabaseAnalyzer(
            self.client_config['supabase_url'],
            self.client_config['supabase_key']
        )

        self.security_auditor = SecurityAuditor(self.client_config)
        self.dependency_manager = DependencyManager()
        self.usage_analyzer = UsageAnalyzer(
            self.client_config['supabase_url'],
            self.client_config['supabase_key']
        )

        self.report_generator = ReportGenerator(
            self.client_config,
            self.config['report_settings']
        )

        if self.config['github_settings']['create_prs']:
            github_token = os.getenv("GITHUB_TOKEN")
            if github_token:
                self.github_manager = GitHubManager(
                    github_token,
                    self.client_config['github_repo']
                )
            else:
                logger.warning("GITHUB_TOKEN not set, PR creation disabled")
                self.github_manager = None
        else:
            self.github_manager = None

        # Results storage
        self.results = {
            'performance': {},
            'security': {},
            'dependencies': {},
            'usage': {},
            'recommendations': [],
            'optimizations': [],
            'roi': {},
            'metadata': {
                'client_name': client_name,
                'run_date': self.run_date.isoformat(),
                'subscription_tier': self.client_config['subscription_tier'],
                'monthly_fee': self.client_config['monthly_fee']
            }
        }

        logger.info("Monthly Value Agent initialized", client=client_name)

    def _load_config(self) -> Dict[str, Any]:
        """Load and validate configuration"""
        config_path = Path(__file__).parent / "config.yaml"

        if not config_path.exists():
            raise ConfigurationError(f"Configuration file not found: {config_path}")

        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)

        # Substitute environment variables
        config_str = yaml.dump(config)
        for key, value in os.environ.items():
            config_str = config_str.replace(f"${{{key}}}", value)

        return yaml.safe_load(config_str)

    async def analyze_database_performance(self):
        """Analyze database performance and identify slow queries"""
        logger.info("Analyzing database performance")

        try:
            # Get slow queries
            slow_queries = await self.db_analyzer.find_slow_queries(
                threshold_ms=self.config['analysis_settings']['performance']['slow_query_threshold_ms']
            )

            # Analyze table statistics
            table_stats = await self.db_analyzer.get_table_statistics()

            # Find missing indexes
            missing_indexes = await self.db_analyzer.suggest_indexes()

            # Check RLS policies
            rls_coverage = await self.db_analyzer.check_rls_coverage()

            self.results['performance'] = {
                'slow_queries': slow_queries,
                'table_statistics': table_stats,
                'missing_indexes': missing_indexes,
                'rls_coverage': rls_coverage,
                'total_queries_analyzed': len(slow_queries),
                'optimization_potential': len(missing_indexes)
            }

            logger.info("Database performance analysis complete",
                       slow_queries=len(slow_queries),
                       missing_indexes=len(missing_indexes))

        except Exception as e:
            logger.error("Database analysis failed", error=str(e))
            self.results['performance']['error'] = str(e)

    async def run_security_audit(self):
        """Run comprehensive security audit"""
        logger.info("Running security audit")

        try:
            # Check for exposed secrets
            exposed_secrets = await self.security_auditor.scan_for_secrets()

            # Audit API endpoints
            api_vulnerabilities = await self.security_auditor.audit_api_endpoints()

            # Check dependency vulnerabilities
            dep_vulnerabilities = await self.security_auditor.scan_dependencies()

            # Validate RLS policies
            rls_issues = await self.security_auditor.validate_rls_policies()

            # Check CORS configuration
            cors_issues = await self.security_auditor.check_cors_config()

            self.results['security'] = {
                'exposed_secrets': exposed_secrets,
                'api_vulnerabilities': api_vulnerabilities,
                'dependency_vulnerabilities': dep_vulnerabilities,
                'rls_issues': rls_issues,
                'cors_issues': cors_issues,
                'total_issues': (
                    len(exposed_secrets) +
                    len(api_vulnerabilities) +
                    len(dep_vulnerabilities) +
                    len(rls_issues) +
                    len(cors_issues)
                ),
                'severity_breakdown': self._calculate_severity_breakdown([
                    *exposed_secrets,
                    *api_vulnerabilities,
                    *dep_vulnerabilities,
                    *rls_issues,
                    *cors_issues
                ])
            }

            logger.info("Security audit complete",
                       total_issues=self.results['security']['total_issues'])

        except Exception as e:
            logger.error("Security audit failed", error=str(e))
            self.results['security']['error'] = str(e)

    async def analyze_dependencies(self):
        """Analyze and update dependencies"""
        logger.info("Analyzing dependencies")

        try:
            # Get current dependencies
            current_deps = await self.dependency_manager.get_dependencies()

            # Check for updates
            updates_available = await self.dependency_manager.check_updates()

            # Identify breaking changes
            breaking_changes = await self.dependency_manager.identify_breaking_changes(
                updates_available
            )

            # Calculate update safety score
            safety_scores = await self.dependency_manager.calculate_safety_scores(
                updates_available
            )

            self.results['dependencies'] = {
                'current': current_deps,
                'updates_available': updates_available,
                'breaking_changes': breaking_changes,
                'safety_scores': safety_scores,
                'total_packages': len(current_deps),
                'outdated_packages': len(updates_available),
                'safe_updates': len([s for s in safety_scores if s['score'] >= 8])
            }

            logger.info("Dependency analysis complete",
                       outdated=len(updates_available),
                       safe_updates=self.results['dependencies']['safe_updates'])

        except Exception as e:
            logger.error("Dependency analysis failed", error=str(e))
            self.results['dependencies']['error'] = str(e)

    async def analyze_usage_patterns(self):
        """Analyze usage patterns and feature adoption"""
        logger.info("Analyzing usage patterns")

        try:
            # Get active users
            active_users = await self.usage_analyzer.get_active_users(
                days=30
            )

            # Track feature usage
            feature_usage = await self.usage_analyzer.track_feature_usage()

            # Analyze API calls
            api_metrics = await self.usage_analyzer.analyze_api_calls()

            # Get error rates
            error_metrics = await self.usage_analyzer.get_error_metrics()

            # Calculate growth metrics
            growth_metrics = await self.usage_analyzer.calculate_growth()

            self.results['usage'] = {
                'active_users': active_users,
                'feature_usage': feature_usage,
                'api_metrics': api_metrics,
                'error_metrics': error_metrics,
                'growth_metrics': growth_metrics,
                'total_active_users': len(active_users),
                'most_used_features': sorted(
                    feature_usage.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:5],
                'least_used_features': sorted(
                    feature_usage.items(),
                    key=lambda x: x[1]
                )[:5]
            }

            logger.info("Usage analysis complete",
                       active_users=len(active_users),
                       total_api_calls=api_metrics.get('total_calls', 0))

        except Exception as e:
            logger.error("Usage analysis failed", error=str(e))
            self.results['usage']['error'] = str(e)

    async def generate_recommendations(self):
        """Use Claude to generate intelligent recommendations"""
        logger.info("Generating recommendations with Claude")

        try:
            # Prepare context for Claude
            context = {
                'client': self.client_config['name'],
                'tier': self.client_config['subscription_tier'],
                'features': self.client_config['features'],
                'performance': self.results.get('performance', {}),
                'security': self.results.get('security', {}),
                'usage': self.results.get('usage', {}),
                'dependencies': self.results.get('dependencies', {})
            }

            prompt = f"""Analyze this client's application and provide actionable recommendations:

Client: {context['client']}
Subscription Tier: {context['tier']}

Current Features: {', '.join(context['features'])}

Performance Analysis:
- Slow queries: {len(context['performance'].get('slow_queries', []))}
- Missing indexes: {len(context['performance'].get('missing_indexes', []))}

Security Analysis:
- Total issues: {context['security'].get('total_issues', 0)}
- Critical issues: {context['security'].get('severity_breakdown', {}).get('critical', 0)}

Usage Patterns:
- Active users (30 days): {context['usage'].get('total_active_users', 0)}
- Most used features: {[f[0] for f in context['usage'].get('most_used_features', [])]}
- Least used features: {[f[0] for f in context['usage'].get('least_used_features', [])]}

Dependencies:
- Outdated packages: {context['dependencies'].get('outdated_packages', 0)}
- Safe updates available: {context['dependencies'].get('safe_updates', 0)}

Please provide:
1. **Performance Optimizations** (3-5 specific recommendations)
2. **New Feature Suggestions** (based on usage patterns, 3-5 ideas)
3. **Security Improvements** (prioritized list)
4. **User Experience Enhancements** (based on feature usage)
5. **Technical Debt Reduction** (3 high-impact items)

Format as JSON:
{{
  "performance_optimizations": [
    {{"title": "...", "description": "...", "impact": "high|medium|low", "effort": "high|medium|low"}}
  ],
  "feature_suggestions": [...],
  "security_improvements": [...],
  "ux_enhancements": [...],
  "technical_debt": [...]
}}
"""

            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Parse recommendations
            response_text = response.content[0].text

            # Extract JSON
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                recommendations = json.loads(json_match.group())
                self.results['recommendations'] = recommendations

                logger.info("Recommendations generated",
                           performance=len(recommendations.get('performance_optimizations', [])),
                           features=len(recommendations.get('feature_suggestions', [])))

        except Exception as e:
            logger.error("Recommendation generation failed", error=str(e))
            self.results['recommendations'] = {'error': str(e)}

    async def calculate_roi(self):
        """Calculate ROI and value delivered"""
        logger.info("Calculating ROI")

        try:
            # Calculate value delivered
            months_subscribed = self._calculate_months_subscribed()
            total_paid = months_subscribed * self.client_config['monthly_fee']

            # Estimate value from optimizations
            performance_value = len(self.results['performance'].get('missing_indexes', [])) * 100
            security_value = self.results['security'].get('total_issues', 0) * 200
            feature_value = len(self.results['recommendations'].get('feature_suggestions', [])) * 500

            # Time saved
            hours_saved = (
                len(self.results['performance'].get('slow_queries', [])) * 2 +  # Query optimization
                self.results['security'].get('total_issues', 0) * 3 +  # Security fixes
                len(self.results['dependencies'].get('safe_updates', [])) * 0.5  # Dependency updates
            )

            time_value = hours_saved * 150  # $150/hour developer rate

            total_value_delivered = performance_value + security_value + feature_value + time_value

            roi_percentage = ((total_value_delivered - total_paid) / total_paid * 100) if total_paid > 0 else 0

            self.results['roi'] = {
                'months_subscribed': months_subscribed,
                'total_paid': total_paid,
                'performance_value': performance_value,
                'security_value': security_value,
                'feature_value': feature_value,
                'time_saved_hours': hours_saved,
                'time_value': time_value,
                'total_value_delivered': total_value_delivered,
                'roi_percentage': roi_percentage,
                'value_breakdown': {
                    'Performance Optimizations': performance_value,
                    'Security Fixes': security_value,
                    'New Features': feature_value,
                    'Time Saved': time_value
                }
            }

            logger.info("ROI calculated",
                       total_value=total_value_delivered,
                       roi_percentage=roi_percentage)

        except Exception as e:
            logger.error("ROI calculation failed", error=str(e))
            self.results['roi'] = {'error': str(e)}

    def _calculate_months_subscribed(self) -> int:
        """Calculate months since subscription start"""
        launch_date = datetime.fromisoformat(self.client_config['launch_date'])
        delta = self.run_date - launch_date
        return max(1, delta.days // 30)

    def _calculate_severity_breakdown(self, issues: List[Dict]) -> Dict[str, int]:
        """Calculate breakdown by severity"""
        breakdown = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}

        for issue in issues:
            severity = issue.get('severity', 'low')
            if severity in breakdown:
                breakdown[severity] += 1

        return breakdown

    async def create_optimizations_pr(self):
        """Create GitHub PR with automated optimizations"""
        if not self.github_manager:
            logger.info("GitHub PR creation disabled")
            return

        logger.info("Creating optimization PR")

        try:
            # Collect safe optimizations
            optimizations = []

            # Add index suggestions
            for index in self.results['performance'].get('missing_indexes', [])[:5]:
                optimizations.append({
                    'type': 'database_index',
                    'title': f"Add index to {index['table']}.{index['column']}",
                    'description': f"Optimize query performance by adding index",
                    'sql': index['sql'],
                    'impact': 'high'
                })

            # Add safe dependency updates
            for dep in self.results['dependencies'].get('safe_updates', [])[:10]:
                optimizations.append({
                    'type': 'dependency_update',
                    'title': f"Update {dep['name']} to {dep['latest_version']}",
                    'description': dep['changelog'],
                    'impact': 'low'
                })

            if optimizations:
                pr_url = await self.github_manager.create_optimization_pr(
                    optimizations,
                    self.run_date
                )

                self.results['optimizations'] = {
                    'pr_created': True,
                    'pr_url': pr_url,
                    'total_optimizations': len(optimizations),
                    'optimizations': optimizations
                }

                logger.info("Optimization PR created", pr_url=pr_url)
            else:
                logger.info("No optimizations to apply")

        except Exception as e:
            logger.error("PR creation failed", error=str(e))
            self.results['optimizations'] = {'error': str(e)}

    async def generate_report(self):
        """Generate comprehensive PDF report"""
        logger.info("Generating PDF report")

        try:
            report_path = await self.report_generator.generate_pdf(
                self.results,
                self.run_date
            )

            logger.info("Report generated", path=report_path)

            return report_path

        except Exception as e:
            logger.error("Report generation failed", error=str(e))
            return None

    async def run_monthly_analysis(self):
        """Run complete monthly analysis"""
        logger.info("Starting monthly value analysis",
                   client=self.client_name,
                   date=self.run_date.strftime('%Y-%m-%d'))

        start_time = datetime.now()

        try:
            # Run all analyses in parallel where possible
            await asyncio.gather(
                self.analyze_database_performance(),
                self.run_security_audit(),
                self.analyze_dependencies(),
                self.analyze_usage_patterns(),
                return_exceptions=True
            )

            # Generate AI recommendations
            await self.generate_recommendations()

            # Calculate ROI
            await self.calculate_roi()

            # Create optimization PR
            await self.create_optimizations_pr()

            # Generate report
            report_path = await self.generate_report()

            duration = (datetime.now() - start_time).total_seconds()

            logger.info("Monthly analysis complete",
                       duration_seconds=duration,
                       report_path=report_path)

            # Print summary
            self._print_summary()

            return True

        except Exception as e:
            logger.error("Monthly analysis failed",
                        error=str(e),
                        traceback=traceback.format_exc())
            return False

    def _print_summary(self):
        """Print analysis summary"""
        print("\n" + "="*80)
        print(f"📊 MONTHLY VALUE REPORT - {self.client_config['name']}")
        print("="*80)

        print(f"\n🎯 Performance:")
        print(f"  • Slow queries identified: {len(self.results['performance'].get('slow_queries', []))}")
        print(f"  • Missing indexes: {len(self.results['performance'].get('missing_indexes', []))}")

        print(f"\n🔒 Security:")
        print(f"  • Total issues: {self.results['security'].get('total_issues', 0)}")
        print(f"  • Critical: {self.results['security'].get('severity_breakdown', {}).get('critical', 0)}")

        print(f"\n📦 Dependencies:")
        print(f"  • Outdated packages: {self.results['dependencies'].get('outdated_packages', 0)}")
        print(f"  • Safe updates: {self.results['dependencies'].get('safe_updates', 0)}")

        print(f"\n👥 Usage:")
        print(f"  • Active users (30d): {self.results['usage'].get('total_active_users', 0)}")

        print(f"\n💰 ROI:")
        roi_data = self.results.get('roi', {})
        print(f"  • Total paid: ${roi_data.get('total_paid', 0):,.2f}")
        print(f"  • Value delivered: ${roi_data.get('total_value_delivered', 0):,.2f}")
        print(f"  • ROI: {roi_data.get('roi_percentage', 0):.1f}%")
        print(f"  • Time saved: {roi_data.get('time_saved_hours', 0):.1f} hours")

        print(f"\n🚀 Recommendations:")
        recs = self.results.get('recommendations', {})
        print(f"  • Performance optimizations: {len(recs.get('performance_optimizations', []))}")
        print(f"  • Feature suggestions: {len(recs.get('feature_suggestions', []))}")
        print(f"  • Security improvements: {len(recs.get('security_improvements', []))}")

        print("\n" + "="*80)


async def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python agent.py <client_name>")
        print("\nAvailable clients:")

        # Load config to show clients
        config_path = Path(__file__).parent / "config.yaml"
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            for client in config.get('clients', {}).keys():
                print(f"  - {client}")

        sys.exit(1)

    client_name = sys.argv[1]

    try:
        agent = MonthlyValueAgent(client_name)
        success = await agent.run_monthly_analysis()

        sys.exit(0 if success else 1)

    except ConfigurationError as e:
        logger.error("Configuration error", error=str(e))
        print(f"\n❌ Configuration Error: {e}", file=sys.stderr)
        sys.exit(2)

    except Exception as e:
        logger.error("Unexpected error",
                    error=str(e),
                    traceback=traceback.format_exc())
        print(f"\n❌ Unexpected Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
