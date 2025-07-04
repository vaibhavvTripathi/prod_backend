import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

class ExpoFileTreeGenerator:
    def __init__(self):
        # Common directories and files to ignore in Expo/React Native projects
        self.ignore_dirs = {
            'node_modules',
            '.git',
            '.expo',
            '.expo-shared',
            'build',
            'dist',
            'coverage',
            '__pycache__',
            '.pytest_cache',
            '.vscode',
            '.idea',
            'android/build',
            'android/app/build',
            'android/.gradle',
            'ios/build',
            'ios/Pods',
            'ios/DerivedData',
            'web-build',
            '.next',
            'out',
            'tmp',
            'temp'
        }
        
        # Common files to ignore
        self.ignore_files = {
            '.DS_Store',
            'Thumbs.db',
            '.gitignore',
            '.env.local',
            '.env.development.local',
            '.env.test.local',
            '.env.production.local',
            'npm-debug.log*',
            'yarn-debug.log*',
            'yarn-error.log*',
            '.expo/README.md'
        }
        
        # File extensions to include content for (common code files)
        self.include_content_extensions = {
            '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', 
            '.yml', '.yaml', '.xml', '.css', '.scss', '.sass',
            '.html', '.htm', '.py', '.java', '.kt', '.swift',
            '.m', '.h', '.cpp', '.c', '.sh', '.bat', '.gradle',
            '.properties', '.plist', '.pbxproj'
        }
        
        # Maximum file size to read content (in bytes) - 1MB
        self.max_file_size = 1024 * 1024

    def should_ignore_item(self, item_path: Path, is_dir: bool) -> bool:
        """Check if an item should be ignored based on ignore rules."""
        item_name = item_path.name
        
        if is_dir:
            # Check if directory should be ignored
            if item_name in self.ignore_dirs:
                return True
            # Check relative path patterns
            relative_path = str(item_path).replace('\\', '/')
            for ignore_dir in self.ignore_dirs:
                if ignore_dir in relative_path:
                    return True
        else:
            # Check if file should be ignored
            if item_name in self.ignore_files:
                return True
            # Check for pattern matches
            if item_name.startswith('.') and item_name.endswith('.log'):
                return True
            if item_name.endswith('.lock'):
                return True
        
        return False

    def should_include_content(self, file_path: Path) -> bool:
        """Check if file content should be included."""
        # Check file extension
        if file_path.suffix.lower() not in self.include_content_extensions:
            return False
        
        # Check file size
        try:
            if file_path.stat().st_size > self.max_file_size:
                return False
        except (OSError, IOError):
            return False
        
        return True

    def read_file_content(self, file_path: Path) -> Optional[str]:
        """Safely read file content."""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except (OSError, IOError, UnicodeDecodeError):
            try:
                # Try with different encoding
                with open(file_path, 'r', encoding='latin-1', errors='ignore') as f:
                    return f.read()
            except:
                return None

    def generate_file_tree(self, root_path: str) -> Dict[str, Any]:
        """Generate the file tree structure."""
        root = Path(root_path)
        if not root.exists():
            raise ValueError(f"Path does not exist: {root_path}")
        
        if not root.is_dir():
            raise ValueError(f"Path is not a directory: {root_path}")
        
        def build_tree(current_path: Path, relative_root: Path) -> Dict[str, Any]:
            """Recursively build the tree structure."""
            relative_path = current_path.relative_to(relative_root)
            path_str = str(relative_path).replace('\\', '/')
            
            item = {
                'name': current_path.name,
                'path': path_str,
                'type': 'folder' if current_path.is_dir() else 'file'
            }
            
            if current_path.is_dir():
                children = []
                try:
                    # Sort items: directories first, then files, both alphabetically
                    items = sorted(current_path.iterdir(), 
                                 key=lambda x: (x.is_file(), x.name.lower()))
                    
                    for child in items:
                        if not self.should_ignore_item(child, child.is_dir()):
                            child_item = build_tree(child, relative_root)
                            if child_item:  # Only add if not None
                                children.append(child_item)
                except (OSError, PermissionError):
                    # Skip directories we can't read
                    pass
                
                if children:
                    item['children'] = children
            else:
                # It's a file
                if self.should_include_content(current_path):
                    content = self.read_file_content(current_path)
                    if content is not None:
                        item['content'] = content
            
            return item
        
        return build_tree(root, root)

    def generate_json(self, root_path: str, output_file: Optional[str] = None) -> str:
        """Generate JSON representation of the file tree."""
        tree = self.generate_file_tree(root_path)
        json_str = json.dumps(tree, indent=2, ensure_ascii=False)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(json_str)
            print(f"File tree saved to: {output_file}")
        
        return json_str

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate JSON file tree for Expo projects')
    parser.add_argument('root_path', help='Root directory path to traverse')
    parser.add_argument('-o', '--output', help='Output JSON file path (optional)')
    parser.add_argument('--print', action='store_true', help='Print JSON to console')
    
    args = parser.parse_args()
    
    generator = ExpoFileTreeGenerator()
    
    try:
        json_result = generator.generate_json(args.root_path, args.output)
        
        if args.print or not args.output:
            print(json_result)
            
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())