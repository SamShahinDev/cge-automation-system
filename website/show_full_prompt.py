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
        
        # Show overview
        print(f"📝 PHASE 2, PROMPT 3: {title}")
        print("=" * 80)
        print()
        
        # Extract key sections
        lines = prompt_content.split('\n')
        
        # Show first 30 lines for overview
        print("PROMPT OVERVIEW (first 30 lines):")
        print("-" * 80)
        for i, line in enumerate(lines[:30]):
            print(line)
        print()
        
        # Count code blocks
        code_blocks = prompt_content.count('```')
        print(f"📊 PROMPT STATISTICS:")
        print(f"   Total Characters: {len(prompt_content)}")
        print(f"   Total Lines: {len(lines)}")
        print(f"   Code Blocks: {code_blocks // 2}")
        print()
        
        # Extract requirements
        if "Component Requirements:" in prompt_content:
            print("🎯 KEY REQUIREMENTS:")
            req_start = prompt_content.find("Component Requirements:")
            req_section = prompt_content[req_start:req_start+500]
            for line in req_section.split('\n')[:10]:
                if line.strip():
                    print(f"   {line}")
