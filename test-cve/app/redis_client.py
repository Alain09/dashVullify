import redis.asyncio as redis
import json
import os
from typing import Any, Optional

class RedisClient:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL")
        self.client: Optional[redis.Redis] = None

    async def connect(self):
        """Établir la connexion Redis"""
        self.client = await redis.from_url(
            self.redis_url,
            encoding="utf-8",
            decode_responses=True
        )

    async def disconnect(self):
        """Fermer la connexion Redis"""
        if self.client:
            await self.client.close()

    async def set_json(self, key: str, value: Any, ttl: int = None) -> bool:
        """Stocker un objet JSON avec TTL optionnel"""
        if not self.client:
            await self.connect()
        
        try:
            serialized = json.dumps(value, default=str)
            if ttl:
                return await self.client.setex(key, ttl, serialized)
            else:
                return await self.client.set(key, serialized)
        except Exception as e:
            print(f"❌ Erreur Redis set_json: {e}")
            return False

    async def get_json(self, key: str) -> Optional[Any]:
        """Récupérer un objet JSON"""
        if not self.client:
            await self.connect()
        
        try:
            data = await self.client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            print(f"❌ Erreur Redis get_json: {e}")
            return None

    async def delete(self, key: str) -> bool:
        """Supprimer une clé"""
        if not self.client:
            await self.connect()
        
        try:
            return await self.client.delete(key) > 0
        except Exception as e:
            print(f"❌ Erreur Redis delete: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """Vérifier si une clé existe"""
        if not self.client:
            await self.connect()
        
        try:
            return await self.client.exists(key) > 0
        except Exception as e:
            print(f"❌ Erreur Redis exists: {e}")
            return False

    async def keys(self, pattern: str = "*") -> list:
        """Lister les clés selon un pattern"""
        if not self.client:
            await self.connect()
        
        try:
            return await self.client.keys(pattern)
        except Exception as e:
            print(f"❌ Erreur Redis keys: {e}")
            return []

# Instance globale
redis_client = RedisClient()


