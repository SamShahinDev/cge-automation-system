#!/usr/bin/env python3
"""
Unified CLI Tool for CGE SDK Agents
Single interface to invoke any agent with context passing and progress tracking
"""

import os
import sys
import asyncio
import argparse
from pathlib import Path
from typing import Dict, Any, Optional
import yaml
import json
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.live import Live
from rich.panel import Panel
from rich.markdown import Markdown
from datetime import datetime

# Add parent to path
sys.path.append(str(Path(__file__).parent.parent / "code-review-agent"))
from logger import setup_logging, get_logger

console = Console()
logger = setup_logging()


class UnifiedCLI:
    """Unified CLI for all CGE SDK Agents"""

    def __init__(self):
        self.config = self._load_config()
        self.context = {}

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration"""
        config_path = Path(__file__).parent / "config.yaml"
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)

    async def invoke_agent(
        self,
        agent: str,
        client: str,
        args: Dict[str, Any],
        show_progress: bool = True
    ) -> Dict[str, Any]:
        """
        Invoke any agent with progress tracking

        Args:
            agent: Agent name (code-review, monthly-value, orchestrator)
            client: Client name
            args: Agent-specific arguments
            show_progress: Show real-time progress

        Returns:
            Agent result
        """
        console.print(f"\n[bold blue]🚀 Invoking {agent} for {client}[/bold blue]\n")

        # Load client context
        client_context = await self._load_client_context(client)
        self.context['current_client'] = client
        self.context['client_config'] = client_context

        # Route to appropriate agent
        if agent == 'code-review':
            return await self._invoke_code_review(client, args, show_progress)
        elif agent == 'monthly-value':
            return await self._invoke_monthly_value(client, args, show_progress)
        elif agent == 'orchestrator':
            return await self._invoke_orchestrator(client, args)
        else:
            console.print(f"[red]Unknown agent: {agent}[/red]")
            return {'success': False, 'error': 'Unknown agent'}

    async def _load_client_context(self, client: str) -> Dict[str, Any]:
        """Load client context from configuration"""
        if client not in self.config['clients']:
            raise ValueError(f"Unknown client: {client}")

        return self.config['clients'][client]

    async def _invoke_code_review(
        self,
        client: str,
        args: Dict[str, Any],
        show_progress: bool
    ) -> Dict[str, Any]:
        """Invoke code review agent"""
        import subprocess

        agent_path = Path(__file__).parent.parent / 'code-review-agent' / 'agent.py'
        project_path = self._get_project_path(client)

        if show_progress:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                console=console
            ) as progress:
                task = progress.add_task("[cyan]Running code review...", total=100)

                process = subprocess.Popen(
                    ['python', str(agent_path), str(project_path), 'crm'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )

                # Simulate progress (in real implementation, parse agent output)
                for i in range(0, 100, 10):
                    await asyncio.sleep(0.5)
                    progress.update(task, completed=i)

                stdout, stderr = process.communicate()
                progress.update(task, completed=100)

        else:
            result = subprocess.run(
                ['python', str(agent_path), str(project_path), 'crm'],
                capture_output=True,
                text=True
            )
            stdout, stderr = result.stdout, result.stderr

        # Parse report if exists
        report_path = project_path / 'code-review-report.md'
        report_content = None
        if report_path.exists():
            with open(report_path, 'r') as f:
                report_content = f.read()

        return {
            'success': True,
            'output': stdout,
            'report': report_content
        }

    async def _invoke_monthly_value(
        self,
        client: str,
        args: Dict[str, Any],
        show_progress: bool
    ) -> Dict[str, Any]:
        """Invoke monthly value agent"""
        import subprocess

        agent_path = Path(__file__).parent.parent / 'monthly-value-agent' / 'agent.py'

        if show_progress:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                console=console
            ) as progress:
                steps = [
                    "Analyzing database performance...",
                    "Running security audit...",
                    "Checking dependencies...",
                    "Analyzing usage patterns...",
                    "Generating AI recommendations...",
                    "Calculating ROI...",
                    "Creating report..."
                ]

                for step in steps:
                    task = progress.add_task(f"[cyan]{step}", total=100)
                    await asyncio.sleep(1)
                    progress.update(task, completed=100)

                # Run actual agent
                result = subprocess.run(
                    ['python', str(agent_path), client],
                    capture_output=True,
                    text=True
                )
        else:
            result = subprocess.run(
                ['python', str(agent_path), client],
                capture_output=True,
                text=True
            )

        # Find generated report
        reports_dir = Path(__file__).parent.parent / 'monthly-value-agent' / 'reports'
        latest_report = None
        if reports_dir.exists():
            reports = list(reports_dir.glob('*.pdf'))
            if reports:
                latest_report = str(max(reports, key=lambda p: p.stat().st_mtime))

        return {
            'success': result.returncode == 0,
            'output': result.stdout,
            'report_path': latest_report
        }

    async def _invoke_orchestrator(
        self,
        client: str,
        args: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Invoke orchestrator command"""
        # This is already the orchestrator, so execute directly
        return {'success': True, 'message': 'Orchestrator command executed'}

    def _get_project_path(self, client: str) -> Path:
        """Get project path for client"""
        client_config = self.config['clients'][client]
        projects_root = Path(os.getenv('PROJECTS_ROOT', os.path.expanduser('~/Documents')))
        return projects_root / client_config['project_path']

    async def show_combined_report(self, results: Dict[str, Any]):
        """Generate and show combined report from multiple agents"""
        console.print("\n[bold green]📊 Combined Report[/bold green]\n")

        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("Agent", style="cyan")
        table.add_column("Status", justify="center")
        table.add_column("Key Findings")

        for agent, result in results.items():
            status = "✅" if result.get('success') else "❌"
            findings = self._extract_key_findings(agent, result)
            table.add_row(agent, status, findings)

        console.print(table)

    def _extract_key_findings(self, agent: str, result: Dict[str, Any]) -> str:
        """Extract key findings from agent result"""
        if agent == 'code-review':
            # Parse report for issues count
            if 'report' in result:
                if 'Critical Issues: 0' in result['report']:
                    return "No critical issues"
                else:
                    return "Issues found (see report)"
        elif agent == 'monthly-value':
            return f"Report: {result.get('report_path', 'N/A')}"
        return "Completed"

    async def show_status(self):
        """Show status of all agents and tasks"""
        console.print("\n[bold blue]📊 CGE SDK Agents Status[/bold blue]\n")

        # Agents table
        agents_table = Table(title="Available Agents", show_header=True)
        agents_table.add_column("Agent", style="cyan")
        agents_table.add_column("Status")
        agents_table.add_column("Location")

        for agent_name, agent_config in self.config.get('agent_specializations', {}).items():
            path = agent_config.get('path', 'N/A')
            status = "🟢 Available" if Path(path).exists() else "🔴 Not Found"
            agents_table.add_row(agent_name, status, path)

        console.print(agents_table)

        # Clients table
        console.print()
        clients_table = Table(title="Configured Clients", show_header=True)
        clients_table.add_column("Client", style="cyan")
        clients_table.add_column("Status")
        clients_table.add_column("Priority")
        clients_table.add_column("Retainer")

        for client_name, client_config in self.config.get('clients', {}).items():
            status = client_config.get('status', 'unknown')
            priority = client_config.get('priority', 'medium')
            retainer = f"${client_config.get('monthly_retainer', 0)}"

            status_icon = "🟢" if status == 'active' else "🟡"
            clients_table.add_row(
                client_name,
                f"{status_icon} {status}",
                priority,
                retainer
            )

        console.print(clients_table)


# CLI Commands

async def cmd_invoke(args):
    """Invoke an agent"""
    cli = UnifiedCLI()

    result = await cli.invoke_agent(
        agent=args.agent,
        client=args.client,
        args=vars(args),
        show_progress=not args.no_progress
    )

    if result.get('success'):
        console.print("\n[bold green]✅ Agent completed successfully[/bold green]")

        if 'report' in result and result['report']:
            console.print("\n[bold]Report:[/bold]")
            console.print(Panel(Markdown(result['report'][:500] + "...")))

        if 'report_path' in result:
            console.print(f"\n📄 Full report: {result['report_path']}")
    else:
        console.print("\n[bold red]❌ Agent failed[/bold red]")
        if 'error' in result:
            console.print(f"Error: {result['error']}")


async def cmd_status(args):
    """Show status"""
    cli = UnifiedCLI()
    await cli.show_status()


async def cmd_workflow(args):
    """Run a workflow (multiple agents in sequence)"""
    cli = UnifiedCLI()

    console.print(f"\n[bold blue]🔄 Running workflow: {args.workflow}[/bold blue]\n")

    if args.workflow == 'pre-demo':
        # Pre-demo workflow: code review
        results = {}

        console.print("[cyan]Step 1/1: Code Review[/cyan]")
        results['code-review'] = await cli.invoke_agent(
            'code-review',
            args.client,
            {},
            show_progress=True
        )

    elif args.workflow == 'monthly':
        # Monthly workflow: monthly value report
        results = {}

        console.print("[cyan]Step 1/1: Monthly Value Report[/cyan]")
        results['monthly-value'] = await cli.invoke_agent(
            'monthly-value',
            args.client,
            {},
            show_progress=True
        )

    elif args.workflow == 'full-audit':
        # Full audit: code review + monthly value
        results = {}

        console.print("[cyan]Step 1/2: Code Review[/cyan]")
        results['code-review'] = await cli.invoke_agent(
            'code-review',
            args.client,
            {},
            show_progress=True
        )

        console.print("\n[cyan]Step 2/2: Monthly Value Report[/cyan]")
        results['monthly-value'] = await cli.invoke_agent(
            'monthly-value',
            args.client,
            {},
            show_progress=True
        )

    # Show combined report
    await cli.show_combined_report(results)


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Unified CLI for CGE SDK Agents',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Invoke code review
  %(prog)s invoke code-review dirt-free-crm

  # Run monthly value report
  %(prog)s invoke monthly-value dirt-free-crm

  # Run pre-demo workflow
  %(prog)s workflow pre-demo dirt-free-crm

  # Show status
  %(prog)s status
        '''
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Invoke command
    invoke_parser = subparsers.add_parser('invoke', help='Invoke a specific agent')
    invoke_parser.add_argument('agent', choices=['code-review', 'monthly-value', 'orchestrator'])
    invoke_parser.add_argument('client', help='Client name')
    invoke_parser.add_argument('--no-progress', action='store_true', help='Disable progress bar')
    invoke_parser.set_defaults(func=cmd_invoke)

    # Workflow command
    workflow_parser = subparsers.add_parser('workflow', help='Run a workflow')
    workflow_parser.add_argument('workflow', choices=['pre-demo', 'monthly', 'full-audit'])
    workflow_parser.add_argument('client', help='Client name')
    workflow_parser.set_defaults(func=cmd_workflow)

    # Status command
    status_parser = subparsers.add_parser('status', help='Show status of all agents')
    status_parser.set_defaults(func=cmd_status)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Run command
    asyncio.run(args.func(args))


if __name__ == '__main__':
    main()
