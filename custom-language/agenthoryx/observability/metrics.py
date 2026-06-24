import time
import random

class MetricsDashboard:
    def __init__(self):
        self.metrics = {
            "cpu_usage": 0.0,
            "memory_usage": 0.0,
            "token_usage": 0,
            "api_calls": 0,
            "costs": 0.0
        }

    def record_api_call(self, tokens_used):
        self.metrics["api_calls"] += 1
        self.metrics["token_usage"] += tokens_used
        # Rough estimate: $0.002 per 1K tokens
        self.metrics["costs"] += (tokens_used / 1000.0) * 0.002

    def sample_system(self):
        # Simulated system metrics
        self.metrics["cpu_usage"] = random.uniform(10.0, 45.0)
        self.metrics["memory_usage"] = random.uniform(120.0, 512.0)

    def print_report(self):
        self.sample_system()
        print("--- Agenthoryx Observability Report ---")
        print(f"CPU Usage:    {self.metrics['cpu_usage']:.2f}%")
        print(f"Memory Usage: {self.metrics['memory_usage']:.2f} MB")
        print(f"API Calls:    {self.metrics['api_calls']}")
        print(f"Token Usage:  {self.metrics['token_usage']}")
        print(f"Estimated Cost:${self.metrics['costs']:.4f}")
        print("-----------------------------------")
