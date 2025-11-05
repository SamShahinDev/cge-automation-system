"""PDF report generation module"""

import asyncio
from typing import Dict, Any
from datetime import datetime
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import plotly.graph_objects as go
import plotly.express as px
from weasyprint import HTML, CSS
import markdown


class ReportGenerator:
    """Generates beautiful PDF reports"""

    def __init__(self, client_config: Dict[str, Any], report_settings: Dict[str, Any]):
        self.client_config = client_config
        self.report_settings = report_settings

        # Setup Jinja2 environment
        template_dir = Path(__file__).parent.parent / 'templates'
        self.env = Environment(loader=FileSystemLoader(str(template_dir)))

    async def generate_pdf(
        self,
        results: Dict[str, Any],
        run_date: datetime
    ) -> str:
        """
        Generate comprehensive PDF report

        Args:
            results: Analysis results
            run_date: Date of analysis

        Returns:
            Path to generated PDF
        """
        # Create output directory
        output_dir = Path(self.report_settings.get('output_dir', 'reports'))
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate charts
        charts = await self._generate_charts(results)

        # Prepare template context
        context = {
            'client': self.client_config,
            'results': results,
            'charts': charts,
            'run_date': run_date,
            'settings': self.report_settings,
            'metadata': results.get('metadata', {})
        }

        # Render HTML from template
        template = self.env.get_template('monthly_report.html')
        html_content = template.render(**context)

        # Generate PDF
        filename = f"monthly-value-report-{run_date.strftime('%Y-%m')}.pdf"
        output_path = output_dir / filename

        HTML(string=html_content).write_pdf(
            str(output_path),
            stylesheets=[CSS(string=self._get_custom_css())]
        )

        return str(output_path)

    async def _generate_charts(self, results: Dict[str, Any]) -> Dict[str, str]:
        """Generate charts as base64 encoded images"""
        charts = {}

        # ROI Chart
        charts['roi'] = self._create_roi_chart(results.get('roi', {}))

        # Feature Usage Chart
        charts['feature_usage'] = self._create_feature_usage_chart(
            results.get('usage', {})
        )

        # Security Issues Chart
        charts['security'] = self._create_security_chart(
            results.get('security', {})
        )

        # Performance Chart
        charts['performance'] = self._create_performance_chart(
            results.get('performance', {})
        )

        return charts

    def _create_roi_chart(self, roi_data: Dict[str, Any]) -> str:
        """Create ROI breakdown chart"""
        if not roi_data or 'value_breakdown' not in roi_data:
            return ""

        breakdown = roi_data['value_breakdown']

        fig = go.Figure(data=[
            go.Bar(
                x=list(breakdown.keys()),
                y=list(breakdown.values()),
                marker_color=self.report_settings.get('brand_color', '#2563eb')
            )
        ])

        fig.update_layout(
            title='Value Delivered This Month',
            yaxis_title='Value ($)',
            showlegend=False,
            height=400
        )

        return fig.to_html(include_plotlyjs='cdn', div_id='roi-chart')

    def _create_feature_usage_chart(self, usage_data: Dict[str, Any]) -> str:
        """Create feature usage chart"""
        if not usage_data or 'feature_usage' not in usage_data:
            return ""

        feature_usage = usage_data['feature_usage']
        if not feature_usage:
            return ""

        features = list(feature_usage.keys())
        counts = list(feature_usage.values())

        fig = go.Figure(data=[
            go.Pie(
                labels=features,
                values=counts,
                hole=0.3
            )
        ])

        fig.update_layout(
            title='Feature Usage Distribution',
            height=400
        )

        return fig.to_html(include_plotlyjs='cdn', div_id='usage-chart')

    def _create_security_chart(self, security_data: Dict[str, Any]) -> str:
        """Create security issues chart"""
        if not security_data or 'severity_breakdown' not in security_data:
            return ""

        breakdown = security_data['severity_breakdown']

        fig = go.Figure(data=[
            go.Bar(
                x=list(breakdown.keys()),
                y=list(breakdown.values()),
                marker_color=['#dc2626', '#ea580c', '#ca8a04', '#65a30d']
            )
        ])

        fig.update_layout(
            title='Security Issues by Severity',
            yaxis_title='Count',
            height=400
        )

        return fig.to_html(include_plotlyjs='cdn', div_id='security-chart')

    def _create_performance_chart(self, performance_data: Dict[str, Any]) -> str:
        """Create performance metrics chart"""
        if not performance_data:
            return ""

        # Create simple metrics display
        metrics = {
            'Slow Queries': len(performance_data.get('slow_queries', [])),
            'Missing Indexes': len(performance_data.get('missing_indexes', [])),
        }

        fig = go.Figure(data=[
            go.Bar(
                x=list(metrics.keys()),
                y=list(metrics.values()),
                marker_color=self.report_settings.get('brand_color', '#2563eb')
            )
        ])

        fig.update_layout(
            title='Performance Optimization Opportunities',
            yaxis_title='Count',
            height=400
        )

        return fig.to_html(include_plotlyjs='cdn', div_id='performance-chart')

    def _get_custom_css(self) -> str:
        """Get custom CSS for PDF styling"""
        return f"""
        @page {{
            size: A4;
            margin: 1cm;
        }}

        body {{
            font-family: 'Inter', -apple-system, sans-serif;
            line-height: 1.6;
            color: #1e293b;
        }}

        .header {{
            background: {self.report_settings.get('brand_color', '#2563eb')};
            color: white;
            padding: 2rem;
            margin-bottom: 2rem;
        }}

        .metric-card {{
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }}

        .recommendation {{
            background: #f1f5f9;
            border-left: 4px solid {self.report_settings.get('brand_color', '#2563eb')};
            padding: 1rem;
            margin-bottom: 1rem;
        }}

        h1, h2, h3 {{
            color: {self.report_settings.get('brand_color', '#2563eb')};
        }}

        .roi-highlight {{
            font-size: 3rem;
            font-weight: bold;
            color: {self.report_settings.get('brand_color', '#2563eb')};
        }}
        """
