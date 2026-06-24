class ModelGateway:
    def __init__(self):
        self.providers = {
            "gpt": "OpenAI GPT-4",
            "claude": "Anthropic Claude 3",
            "gemini": "Google Gemini 1.5",
            "local": "Llama 3 Local"
        }

    def chat(self, prompt, model="auto", complexity="medium"):
        print(f"[ModelGateway] Received chat request. Model preference: {model}")
        
        selected_model = self.providers.get(model)
        
        if model == "auto":
            # Intelligent routing based on complexity
            if complexity == "high":
                selected_model = self.providers["gpt"]
            elif complexity == "low":
                selected_model = self.providers["local"]
            else:
                selected_model = self.providers["gemini"]
                
        print(f"[ModelGateway] Routing request to: {selected_model}")
        
        # Simulate generation
        import time
        time.sleep(1)
        return f"[{selected_model}] Response to: {prompt[:20]}..."
