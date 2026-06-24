import os

src_dir = r"c:\Users\windows-11\Desktop\jarvis-ai-assistant\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements
    new_content = content.replace('"http://localhost:8000/', '"/api/')
    new_content = new_content.replace('`http://localhost:8000/', '`/api/')
    
    if '"ws://localhost:8000/' in new_content:
        new_content = new_content.replace('"ws://localhost:8000/', '(window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host + "/api/')
    if '`ws://localhost:8000/' in new_content:
        new_content = new_content.replace('`ws://localhost:8000/', '`${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/')

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))
