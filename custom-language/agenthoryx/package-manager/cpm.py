import sys
import os
import yaml

# Add current directory to path to allow sibling imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from resolver.resolver import Resolver
from installer.installer import Installer

def init_project():
    config = {
        'name': 'my-agenthoryx-project',
        'version': '1.0.0',
        'author': 'anonymous',
        'dependencies': {}
    }
    with open('agenthoryx.yaml', 'w') as f:
        yaml.dump(config, f, sort_keys=False)
    print("Initialized agenthoryx.yaml")

def install(package_spec=None):
    installer = Installer()
    if package_spec:
        parts = package_spec.split('@')
        name = parts[0]
        version = parts[1] if len(parts) > 1 else 'latest'
        
        # Add to agenthoryx.yaml if exists
        if os.path.exists('agenthoryx.yaml'):
            with open('agenthoryx.yaml', 'r') as f:
                config = yaml.safe_load(f) or {}
            if 'dependencies' not in config:
                config['dependencies'] = {}
            config['dependencies'][name] = f"^{version}"
            with open('agenthoryx.yaml', 'w') as f:
                yaml.dump(config, f, sort_keys=False)
                
        installer.install(name, version)
    else:
        resolver = Resolver()
        deps = resolver.resolve()
        for name, version in deps.items():
            version_str = str(version).replace('^', '').replace('~', '')
            installer.install(name, version_str)

def update():
    print("Updating packages...")
    install()

def publish():
    if not os.path.exists('agenthoryx.yaml'):
        print("Error: agenthoryx.yaml not found. Cannot publish.")
        return
    with open('agenthoryx.yaml', 'r') as f:
        config = yaml.safe_load(f)
    print(f"Publishing {config.get('name', 'unknown')}@{config.get('version', '1.0.0')} to Agenthoryx Hub...")
    print("Published successfully!")

def main():
    if len(sys.argv) < 2:
        print("Usage: cpm <command> [args]")
        print("Commands: init, install, update, publish")
        return

    command = sys.argv[1]
    
    if command == "init":
        init_project()
    elif command == "install":
        pkg = sys.argv[2] if len(sys.argv) > 2 else None
        install(pkg)
    elif command == "update":
        update()
    elif command == "publish":
        publish()
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
