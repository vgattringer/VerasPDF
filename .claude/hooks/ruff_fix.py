import json
import subprocess
import sys

data = json.load(sys.stdin)
path = data.get('tool_response', {}).get('filePath') or data.get('tool_input', {}).get('file_path')
if path and path.endswith('.py'):
    ruff = [sys.executable, '-m', 'ruff']
    subprocess.run(ruff + ['check', '--fix', path], check=False)
    subprocess.run(ruff + ['format', path], check=False)
