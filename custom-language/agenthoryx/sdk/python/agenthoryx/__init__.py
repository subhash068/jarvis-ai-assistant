# Python SDK for Agenthoryx

import requests

class AgenthoryxClient:
    def __init__(self, endpoint="http://localhost:8080"):
        self.endpoint = endpoint

    def run(self, code):
        """Send Agenthoryx code to the runtime server for execution."""
        response = requests.post(f"{self.endpoint}/run", json={"code": code})
        if response.status_code == 200:
            return response.json().get('output')
        raise Exception(f"Agenthoryx Error: {response.text}")

class Agent:
    def __init__(self, name, client=None):
        self.name = name
        self.client = client or AgenthoryxClient()

    def chat(self, prompt):
        code = f'''
        let agent = new Agent("{self.name}");
        return agent.chat("{prompt}");
        '''
        return self.client.run(code)
