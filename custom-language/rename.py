import os
import re

def replace_in_file(filepath):
    # skip self to avoid breaking the script
    if os.path.basename(filepath) == 'rename.py':
        return
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return

    new_content = content
    # Replacements (using character separation so the regex doesn't match itself after one pass if rerun)
    new_content = re.sub(r'Cognix', 'Agenthoryx', new_content)
    new_content = re.sub(r'cognix', 'agenthoryx', new_content)
    new_content = re.sub(r'COGNIX', 'AGENTHORYX', new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated content in {filepath}")

def rename_files_and_directories(root_dir):
    skip_dirs = {'.git', 'node_modules', '.lovable', 'dist', '.tanstack'}
    
    # Rename contents first
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # modify dirnames in-place to skip
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            replace_in_file(filepath)
            
    # Rename files and directories bottom-up
    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=False):
        # Don't try renaming inside skipped directories, though bottom-up doesn't allow in-place skip easily.
        # We'll just check if any part of the path contains skipped dirs
        if any(skip in dirpath.split(os.sep) for skip in skip_dirs):
            continue

        for filename in filenames:
            if filename == 'rename.py':
                continue
            if 'cognix' in filename.lower():
                new_name = filename.replace('cognix', 'agenthoryx').replace('Cognix', 'Agenthoryx')
                old_path = os.path.join(dirpath, filename)
                new_path = os.path.join(dirpath, new_name)
                os.rename(old_path, new_path)
                print(f"Renamed file {old_path} -> {new_path}")
                
        for dirname in dirnames:
            if 'cognix' in dirname.lower():
                new_name = dirname.replace('cognix', 'agenthoryx').replace('Cognix', 'Agenthoryx')
                old_path = os.path.join(dirpath, dirname)
                new_path = os.path.join(dirpath, new_name)
                os.rename(old_path, new_path)
                print(f"Renamed dir {old_path} -> {new_path}")

if __name__ == "__main__":
    rename_files_and_directories(r"c:\Users\windows-11\Desktop\jarvis-ai-assistant\custom-language")
