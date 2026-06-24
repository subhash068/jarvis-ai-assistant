import os
import yaml

class Resolver:
    def __init__(self, config_file="agenthoryx.yaml"):
        self.config_file = config_file

    def resolve(self):
        if not os.path.exists(self.config_file):
            print(f"Error: {self.config_file} not found.")
            return {}
            
        with open(self.config_file, "r") as f:
            try:
                config = yaml.safe_load(f)
                return config.get('dependencies', {})
            except yaml.YAMLError as exc:
                print(f"Error parsing {self.config_file}: {exc}")
                return {}
