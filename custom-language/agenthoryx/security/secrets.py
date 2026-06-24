import os
import json
import base64

class SecretsManager:
    def __init__(self, vault_path="secrets_vault.json"):
        self.vault_path = vault_path
        self.secrets = {}
        self._load()

    def _load(self):
        if os.path.exists(self.vault_path):
            with open(self.vault_path, 'r') as f:
                encrypted_data = f.read()
                if encrypted_data:
                    # In a real system, this would use KMS and AES.
                    # Here we simulate encryption with base64.
                    decrypted = base64.b64decode(encrypted_data).decode('utf-8')
                    self.secrets = json.loads(decrypted)

    def _save(self):
        decrypted = json.dumps(self.secrets)
        encrypted_data = base64.b64encode(decrypted.encode('utf-8')).decode('utf-8')
        with open(self.vault_path, 'w') as f:
            f.write(encrypted_data)

    def set_secret(self, key, value):
        self.secrets[key] = value
        self._save()

    def get_secret(self, key):
        return self.secrets.get(key)
