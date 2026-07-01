import redis
from qdrant_client import QdrantClient
from sqlalchemy.orm import Session
from models import Memory, User
import logging

logger = logging.getLogger(__name__)

class MemoryOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        # Initialize Redis for Short-Term Memory
        try:
            self.redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
            self.redis_client.ping()
        except redis.ConnectionError:
            logger.warning("Redis is not available. Short-term memory will not work.")
            self.redis_client = None

        # Initialize Qdrant for Semantic Memory
        try:
            self.qdrant_client = QdrantClient("localhost", port=6333)
            # Ensure collection exists here (omitted for scaffolding)
        except Exception as e:
            logger.warning(f"Qdrant is not available: {e}")
            self.qdrant_client = None

    def store_memory(self, user_id: int, text: str, category: str = "general"):
        """
        Memory Flow:
        1. Memory Classifier
        2. Should it be stored?
        3. Importance Scoring
        4. Category Detection
        5. Embedding Generation
        6. Store in DB / Qdrant / Redis
        """
        importance = self._score_importance(text)
        
        if importance == 0:
            logger.info("Memory explicitly ignored (e.g. Secret).")
            return

        # Scaffold: Store in Short Term (Redis)
        if self.redis_client:
            self.redis_client.setex(f"memory:{user_id}:latest", 1800, text) # 30 min TTL

        # Scaffold: Store in Long Term (PostgreSQL)
        if importance >= 3:
            new_memory = Memory(
                user_id=user_id,
                category=category,
                key=text[:20], # Simplified key generation
                value=text,
                importance=importance
            )
            self.db.add(new_memory)
            self.db.commit()

        # Scaffold: Store in Semantic (Qdrant)
        if self.qdrant_client:
            # Generate embedding here and insert into Qdrant
            pass

    def search_memory(self, user_id: int, query: str):
        """
        Memory Search Pipeline:
        1. Intent Detection
        2. Generate Embedding
        3. Search Qdrant
        4. Rank Results
        5. Retrieve PostgreSQL Facts
        6. Combine Results
        """
        results = []
        
        # 1. Check Short-Term
        if self.redis_client:
            short_term = self.redis_client.get(f"memory:{user_id}:latest")
            if short_term:
                results.append({"source": "short_term", "content": short_term})

        # 2. Check Long-Term
        pg_memories = self.db.query(Memory).filter(Memory.user_id == user_id).order_by(Memory.importance.desc()).limit(5).all()
        for mem in pg_memories:
            results.append({"source": "long_term", "content": mem.value, "importance": mem.importance})

        # 3. Check Semantic (Qdrant)
        # Implement vector search here
        
        return results

    def _score_importance(self, text: str) -> int:
        """
        Scores importance from 0 to 5.
        0: Secret (Ignore)
        1: Temporary
        2: Useful
        3: Important
        4: Critical
        5: Never Forget
        """
        # Scaffold logic
        text_lower = text.lower()
        if "api key" in text_lower or "password" in text_lower:
            return 0
        if "my name is" in text_lower:
            return 5
        if "i like" in text_lower or "prefer" in text_lower:
            return 4
        return 2 # Default useful
