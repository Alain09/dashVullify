import hashlib
from typing import Any, Optional, Callable
from redis_client import redis_client
import inspect
import functools

class CacheManager:
    def __init__(self):
        self.default_ttls = {
            "cve_list": 3600,  # 1 heure
            "cve_detail": 3600,  # 1 heure
            "kev_data": 3600,  # 1 heure
            "epss_data": 3600,  # 1 heure
            "github_pocs": 1800,  # 30 minutes
            "reddit_posts": 1800,  # 30 minutes
            "description": 3600,  # 1 heure
            "stats": 3600,  # 1 heure
        }

    def _generate_key(self, prefix: str, func_args: tuple, func_kwargs: dict) -> str:
        """Générer une clé de cache unique basée sur les arguments réels"""
        key_parts = [prefix]
        
        # Ajouter les arguments positionnels
        for arg in func_args:
            key_parts.append(str(arg))
        
        # Ajouter les arguments nommés (triés pour consistance)
        for k, v in sorted(func_kwargs.items()):
            key_parts.append(f"{k}:{v}")
        
        # Créer une empreinte pour les clés trop longues
        key_string = ":".join(key_parts)
        if len(key_string) > 200:
            key_hash = hashlib.md5(key_string.encode()).hexdigest()
            return f"cve_advisory:{prefix}:{key_hash}"
        
        return f"cve_advisory:{key_string}"

    async def get_cached_data(self, key: str) -> Optional[Any]:
        """Récupérer des données du cache"""
        return await redis_client.get_json(key)

    async def set_cached_data(self, key: str, data: Any, ttl: int = None) -> bool:
        """Stocker des données dans le cache"""
        cache_ttl = ttl or self.default_ttls.get(key.split(":")[1], 3600)
        return await redis_client.set_json(key, data, cache_ttl)

    async def invalidate_pattern(self, pattern: str) -> None:
        """Invalider les clés selon un pattern"""
        keys = await redis_client.keys(f"cve_advisory:{pattern}")
        for key in keys:
            await redis_client.delete(key)

# Instance globale
cache_manager = CacheManager()

# Décorateur pour cache automatique - VERSION COMPLÈTEMENT CORRIGÉE
def cached(ttl: int = None, key_prefix: str = None):
    def decorator(func: Callable):
        # Obtenir la signature de la fonction
        sig = inspect.signature(func)
        
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Lier les arguments aux paramètres de la fonction
            bound_args = sig.bind(*args, **kwargs)
            bound_args.apply_defaults()
            
            # Extraire seulement les arguments nommés (exclure 'self' pour les méthodes)
            func_kwargs = {}
            for param_name, param_value in bound_args.arguments.items():
                if param_name != 'self':  # Exclure 'self' pour les méthodes de classe
                    func_kwargs[param_name] = param_value
            
            # Générer la clé de cache
            prefix = key_prefix or func.__name__
            cache_key = cache_manager._generate_key(prefix, (), func_kwargs)
            
            # Essayer de récupérer du cache
            cached_result = await cache_manager.get_cached_data(cache_key)
            if cached_result is not None:
                print(f"✅ Cache HIT: {cache_key}")
                return cached_result
            
            print(f"❌ Cache MISS: {cache_key}")
            # Exécuter la fonction si cache miss
            result = await func(*args, **kwargs)
            
            # Mettre en cache le résultat
            await cache_manager.set_cached_data(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Alternative plus simple - décorateur sans gestion complexe des arguments
def simple_cached(ttl: int = 3600):
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Créer une clé simple basée sur le nom de fonction et les arguments
            key_parts = [func.__name__]
            
            # Ajouter les arguments (limité aux premiers pour éviter des clés trop longues)
            for i, arg in enumerate(args):
                if i < 3:  # Limiter aux 3 premiers arguments
                    key_parts.append(str(arg))
            
            for k, v in kwargs.items():
                key_parts.append(f"{k}:{v}")
            
            cache_key = f"cve_advisory:{':'.join(key_parts)}"
            
            # Vérifier le cache
            cached_result = await cache_manager.get_cached_data(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Exécuter la fonction
            result = await func(*args, **kwargs)
            
            # Mettre en cache
            await cache_manager.set_cached_data(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator