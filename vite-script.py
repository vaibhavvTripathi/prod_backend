#!/usr/bin/env python3
"""
Simple Vite Project File Structure Converter
Run this script directly with your project path.
"""

import os
import json
from pathlib import Path

# Set your project path here
PROJECT_PATH = r"C:\Users\Vaibhav\Desktop\saas\test"

# Common file extensions to read as text
TEXT_EXTENSIONS = {
    '.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.css', '.scss', '.sass',
    '.less', '.json', '.md', '.txt', '.xml', '.yaml', '.yml', '.toml',
    '.env', '.gitignore', '.gitattributes', '.editorconfig', '.prettierrc',
    '.eslintrc', '.eslintignore', '.babelrc', '.postcssrc', '.stylelintrc'
}

# Files/folders to ignore
IGNORE_PATTERNS = {
    'node_modules', '.git', '.svn', '.hg', 'dist', 'build', '.next',
    '.nuxt', '.output', 'coverage', '.nyc_output', '.cache', 'tmp',
    'temp', '.DS_Store', 'Thumbs.db', '.vscode', '.idea'
}

def should_ignore(path_name):
    """Check if a path should be ignored."""
    return path_name in IGNORE_PATTERNS

def read_file_content(file_path):
    """Read file content if it's a text file and under 1MB."""
    try:
        # Check file size (1MB limit)
        if file_path.stat().st_size > 1024 * 1024:
            return None
        
        # Check if it's likely a text file
        if file_path.suffix.lower() not in TEXT_EXTENSIONS:
            return None
        
        # Read as text
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
            
    except (OSError, UnicodeDecodeError):
        return None

def scan_directory(root_path):
    """Recursively scan directory and create FileItem structure."""
    items = []
    
    try:
        # Get all items in directory, sorted
        dir_items = sorted(root_path.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
        
        for item in dir_items:
            if should_ignore(item.name):
                continue
                
            relative_path = str(item.relative_to(root_path.parent))
            
            if item.is_dir():
                # Recursively scan subdirectory
                folder_item = {
                    "name": item.name,
                    "type": "folder",
                    "path": relative_path,
                    "children": scan_directory(item)["children"]
                }
                items.append(folder_item)
            else:
                # Handle file
                content = read_file_content(item)
                
                file_item = {
                    "name": item.name,
                    "type": "file",
                    "path": relative_path
                }
                
                if content is not None:
                    file_item["content"] = content
                
                items.append(file_item)
                
    except PermissionError:
        print(f"Permission denied: {root_path}")
    
    return {
        "name": root_path.name,
        "type": "folder",
        "path": str(root_path.relative_to(root_path.parent)),
        "children": items
    }

def main():
    # Validate project path
    project_path = Path(PROJECT_PATH).resolve()
    if not project_path.exists():
        print(f"Error: Project path does not exist: {project_path}")
        return
    
    if not project_path.is_dir():
        print(f"Error: Project path is not a directory: {project_path}")
        return
    
    print(f"Scanning project: {project_path}")
    
    # Scan the project
    try:
        file_structure = scan_directory(project_path)
        
        # Convert to JSON
        json_output = json.dumps(file_structure, indent=2, ensure_ascii=False)
        
        # Save to file
        output_file = "test_structure.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(json_output)
        
        print(f"File structure saved to: {output_file}")
        print(f"Total items processed: {len(json_output.split('name'))}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()