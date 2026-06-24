import os

class Installer:
    def __init__(self, base_dir="."):
        self.modules_dir = os.path.join(base_dir, "agenthoryx_modules")

    def install(self, package_name, version=None):
        if not os.path.exists(self.modules_dir):
            os.makedirs(self.modules_dir)
            
        pkg_dir = os.path.join(self.modules_dir, package_name)
        if not os.path.exists(pkg_dir):
            os.makedirs(pkg_dir)
            
        # Simulate downloading package contents
        init_file = os.path.join(pkg_dir, "init.agx")
        with open(init_file, "w") as f:
            f.write(f"// Package: {package_name}\n")
            if version:
                f.write(f"// Version: {version}\n")
            f.write(f'print("Loaded {package_name}");\n')
            
        print(f"Installed {package_name}@{version or 'latest'} into {pkg_dir}")
