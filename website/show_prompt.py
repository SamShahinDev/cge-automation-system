import re

with open('ENHANCED_PROMPTS.md', 'r') as f:
    content = f.read()

# Find Prompt 3
pattern = r'^##\s+Enhanced Prompt\s+3:\s+(.+)'
match = re.search(pattern, content, re.MULTILINE)

if match:
    title = match.group(1).strip()
    start_pos = match.end()
    end_marker = content.find('---END PROMPT---', start_pos)
    
    if end_marker != -1:
        prompt_content = content[start_pos:end_marker].strip()
        print(f"📝 Phase 2, Prompt 3: {title}")
        print("=" * 80)
        print(prompt_content[:1000] + "..." if len(prompt_content) > 1000 else prompt_content)
        print("=" * 80)
        print(f"Total length: {len(prompt_content)} characters")
