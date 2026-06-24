class MemoryAPI:
    def __init__(self):
        self.stores = {
            "postgres": {},  # Simulated relational data
            "redis": {},     # Simulated fast key-value
            "vector": {},    # Simulated vector DB for embeddings
            "s3": {}         # Simulated object storage
        }
        self.default_store = "redis"

    def store(self, key, value, store_type=None):
        target = store_type or self.default_store
        if target not in self.stores:
            raise ValueError(f"Unknown store type: {target}")
        
        print(f"[MemoryAPI] Storing key '{key}' in {target}")
        self.stores[target][key] = value

    def retrieve(self, key, store_type=None):
        target = store_type or self.default_store
        if target not in self.stores:
            raise ValueError(f"Unknown store type: {target}")
            
        print(f"[MemoryAPI] Retrieving key '{key}' from {target}")
        return self.stores[target].get(key)

    def vector_search(self, embedding, top_k=3):
        print(f"[MemoryAPI] Performing vector similarity search for top {top_k} matches...")
        # Simulated search result
        return ["doc_1", "doc_5", "doc_12"]
