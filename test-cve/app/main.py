from fastapi import FastAPI, Query, HTTPException
from nvdlib import searchCVE,searchCVE_V2
from datetime import datetime, timedelta, timezone
import requests
import httpx
import os

import asyncio
from typing import Optional

from typing import List, Dict
import asyncpraw

# Import des modules Redis
from redis_client import redis_client
from cache_utils import cache_manager, simple_cached

app = FastAPI(
    title="CVE Advisory API",
    description="API pour l'analyse des vulnérabilités CVE avec données enrichies (KEV, EPSS, GitHub, Reddit)",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_API = "https://api.github.com"
KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
API_KEY = os.getenv("API_KEY")
DEFAULT_DAYS = 30
EXPLOIT_DB_SEARCH = "https://www.exploit-db.com/search"

# Whitelist des tags NVD
EXPLOIT_TAG_WHITELIST = {"exploit", "patch", "issue tracking", "issue-tracking", "issue"}

# Events de démarrage/arrêt
@app.on_event("startup")
async def startup_event():
    """Initialiser Redis et précharger les données au démarrage"""
    await redis_client.connect()
    await preload_kev_cache()
    #await preload_recent_cves_cache()
    print("✅ Application démarrée avec Redis")

@app.on_event("shutdown")
async def shutdown_event():
    """Fermer les connexions à l'arrêt"""
    await redis_client.disconnect()
    print("🔴 Application arrêtée")




# --- Préchargement des CVE récents Gestion du preload cves ( 2000 data ) ---

async def preload_recent_cves_cache():
    """Précharger les CVE des 30 derniers jours avec limite 2000"""
    try:
        print("🔄 Préchargement des CVE récents (30 jours, limite 2000)...")
        
        # Calcul des dates
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=30)
        
        # Recherche des CVE
        results = searchCVE(
            pubStartDate=start_date, 
            pubEndDate=end_date, 
            key=API_KEY, 
            limit=2000
        )
        
        # Transformation des CVE
        cves_output = [await cve_to_dict_full(cve) for cve in results]
        
        # Mise en cache
        cache_key = "cve_advisory:recent_cves:30:2000"
        await cache_manager.set_cached_data(cache_key, cves_output, ttl=3600)
        
        print(f"✅ CVE récents préchargés ({len(cves_output)} CVE mis en cache)")
        return cves_output
        
    except Exception as e:
        print(f"⚠️ Erreur lors du préchargement des CVE récents: {e}")
        # Essayer de récupérer du cache même en cas d'erreur
        try:
            cached_data = await cache_manager.get_cached_data("cve_advisory:recent_cves:30:2000")
            if cached_data:
                print("✅ Récupération des CVE récents depuis le cache de secours")
                return cached_data
        except:
            pass
        return []

# --- Recherche des CVE récents avec cache ---
async def fetch_recent_cves_with_cache(limit: int, days: int) -> dict:
    """Récupérer les CVE récents avec gestion du cache Redis"""
    cache_key = f"cve_advisory:recent_cves:{days}:{limit}"
    
    # Vérifier le cache d'abord
    cached_data = await cache_manager.get_cached_data(cache_key)
    if cached_data:
        print(f"✅ CVE récents chargés depuis le cache (jours={days}, limite={limit})")
        return cached_data
    
    # Si pas en cache, exécuter la recherche
    print(f"🔄 Recherche des CVE récents (jours={days}, limite={limit})...")
    
    start = datetime.now(timezone.utc) - timedelta(days=days)
    end = datetime.now(timezone.utc)

    try:
        # Charger KEV une seule fois pour tous les CVE
        kev_data = await fetch_kev_catalog()
        kev_map = {v["cveID"]: v for v in kev_data.get("vulnerabilities", [])}
        
        results = searchCVE(pubStartDate=start, pubEndDate=end, key=API_KEY, limit=limit)
        
        # Transformer tous les CVE avec le même kev_map
        cves_output = []
        for cve in results:
            cve_data = await cve_to_dict_full(cve, kev_map)
            cves_output.append(cve_data)
        
        response_data = {
            "total": len(cves_output),
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "cves": cves_output
        }
        
        # Mettre en cache pour 1 heure
        await cache_manager.set_cached_data(cache_key, response_data, ttl=3600)
        
        print(f"✅ Recherche CVE récents terminée ({len(cves_output)} CVE trouvés et mis en cache)")
        return response_data
        
    except Exception as e:
        print(f"❌ Erreur lors de la recherche des CVE récents: {e}")
        
        # Fallback sur le préchargement si les paramètres correspondent
        if days == 30 and limit == 2000:
            cached_preload = await cache_manager.get_cached_data("cve_advisory:recent_cves:30:2000")
            if cached_preload:
                print("✅ Utilisation des CVE préchargés comme fallback")
                return {
                    "total": len(cached_preload),
                    "startDate": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
                    "endDate": datetime.now(timezone.utc).isoformat(),
                    "cves": cached_preload
                }
        
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des CVE récents: {e}")
# --- Gestion du cache KEV ---
async def fetch_kev_catalog(force_refresh: bool = False) -> dict:
    """Récupérer le catalogue KEV avec cache Redis"""
    cache_key = "cve_advisory:kev_catalog"
    
    if not force_refresh:
        cached_data = await cache_manager.get_cached_data(cache_key)
        if cached_data:
            print(f"✅ KEV chargé depuis le cache ({len(cached_data.get('vulnerabilities', []))} vulnérabilités)")
            return cached_data

    try:
        print("🔄 Téléchargement du catalogue KEV...")
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(KEV_URL)
            resp.raise_for_status()
            data = resp.json()
            
            # Stocker dans Redis
            await cache_manager.set_cached_data(cache_key, data, ttl=3600)
            print(f"✅ KEV téléchargé et mis en cache ({len(data.get('vulnerabilities', []))} vulnérabilités)")
            return data
    except httpx.HTTPError as e:
        # Fallback sur cache expiré si disponible
        cached_data = await cache_manager.get_cached_data(cache_key)
        if cached_data:
            print(f"⚠️ Utilisation du cache expiré suite à erreur: {e}")
            return cached_data
        print(f"❌ Erreur critique KEV: {e}")
        raise HTTPException(status_code=502, detail=f"Impossible de récupérer le catalogue KEV: {e}")

async def preload_kev_cache():
    """Précharger le catalogue KEV au démarrage ET le mettre en cache"""
    try:
        print("🔄 Préchargement du catalogue KEV...")
        # Forcer le téléchargement et la mise en cache
        data = await fetch_kev_catalog(force_refresh=True)
        
        # Vérifier que les données sont bien présentes
        vulns = data.get("vulnerabilities", [])
        if vulns:
            print(f"✅ KEV préchargé et mis en cache ({len(vulns)} vulnérabilités)")
        else:
            print("⚠️ Aucune vulnérabilité trouvée dans le catalogue KEV")
            
        return data
    except Exception as e:
        print(f"⚠️ Erreur lors du préchargement KEV: {e}")
        # Essayer de récupérer du cache même en cas d'erreur
        try:
            cached_data = await cache_manager.get_cached_data("cve_advisory:kev_catalog")
            if cached_data:
                print("✅ Récupération depuis le cache de secours")
                return cached_data
        except:
            pass
        return {"vulnerabilities": []}
    

# --- Cache EPSS avec Redis ---
@simple_cached(ttl=3600)
async def get_epss_data_safe(cve_id: str) -> dict:
    """Récupérer les données EPSS avec cache Redis"""
    url = f"https://api.first.org/data/v1/epss?cve={cve_id}"
    epss_data = {"epss_score": 0.0, "epss_percentile": 0.0}

    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json().get("data", [])
        if data:
            epss_score = float(data[0].get("epss") or 0)
            epss_percentile = float(data[0].get("percentile") or 0)
            epss_data = {"epss_score": epss_score, "epss_percentile": epss_percentile}
    except Exception as e:
        print(f"⚠️ Erreur récupération EPSS pour {cve_id}: {e}")

    return epss_data

# --- Cache GitHub avec Redis ---
@simple_cached(ttl=1800)
async def fetch_github_pocs(cve_id: str, max_results: int = 5) -> List[Dict]:
    """Chercher des PoC sur GitHub avec cache Redis"""
    if not cve_id:
        return []

    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    headers["Accept"] = "application/vnd.github.v3.star+json"

    results = []
    async with httpx.AsyncClient(timeout=15.0, headers=headers) as client:
        # 1) Search repositories
        try:
            q_repo = f'{cve_id} in:name,description'
            r_repo = await client.get(f"{GITHUB_API}/search/repositories", params={"q": q_repo, "per_page": max_results})
            if r_repo.status_code == 200:
                data = r_repo.json()
                for item in data.get("items", [])[:max_results]:
                    results.append({
                        "source": "GitHub-POC",
                        "url": item.get("html_url"),
                        "stars": item.get("stargazers_count"),
                        "created_at": item.get("created_at"),
                        "type": "repo",
                        "name": item.get("full_name")
                    })
        except Exception:
            pass

        # 2) Search issues/PRs
        try:
            q_issue = f'{cve_id} in:title,body'
            r_issue = await client.get(f"{GITHUB_API}/search/issues", params={"q": q_issue, "per_page": max_results})
            if r_issue.status_code == 200:
                data = r_issue.json()
                for it in data.get("items", [])[:max_results]:
                    results.append({
                        "source": "GitHub-POC",
                        "url": it.get("html_url"),
                        "stars": None,
                        "created_at": it.get("created_at"),
                        "type": "issue",
                        "title": it.get("title")
                    })
        except Exception:
            pass

    # Dédupliquer
    seen = set()
    deduped = []
    for r in results:
        u = r.get("url")
        if u and u not in seen:
            seen.add(u)
            deduped.append(r)
    return deduped

# --- Cache Reddit avec Redis ---
@simple_cached(ttl=1800)
async def fetch_reddit_posts(cve_id: str, limit: int = 5) -> list[dict]:
    """Récupérer les posts Reddit avec cache Redis"""
    reddit = asyncpraw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )

    posts = []
    query = cve_id.upper()
    try:
        subreddit = await reddit.subreddit("netsec", fetch=True)
        async for submission in subreddit.search(query, limit=limit):
            posts.append({
                "title": submission.title,
                "url": submission.url,
                "score": submission.score,
                "created_utc": submission.created_utc,
                "num_comments": submission.num_comments,
                "permalink": f"https://reddit.com{submission.permalink}"
            })
    except Exception as e:
        print(f"⚠️ Erreur Reddit pour {cve_id}: {e}")
    finally:
        await reddit.close()

    return posts

# --- Détection d'exploit public ---
async def detect_public_exploit(cve_obj, kev_map: dict = None) -> dict:
    """Détecter les preuves d'exploit public"""
    cve_id = getattr(cve_obj, "id", None)
    evidence = []
    exploit_db_found = False
    github_found = False
    reddit_found = False

    # Références NVD filtrées
    for ref in getattr(cve_obj, "references", []) or []:
        url = getattr(ref, "url", None)
        tags = getattr(ref, "tags", []) or []

        if not isinstance(tags, (list, tuple)):
            tags = [tags]

        for t in tags:
            if t and t.strip().lower() in EXPLOIT_TAG_WHITELIST:
                if url:
                    evidence.append({"source": t, "url": url})
                break

    # Vérifier Exploit-DB
    try:
        if cve_id:
            exploit_query = cve_id.upper().replace("CVE-", "", 1)
            exploit_url = f"{EXPLOIT_DB_SEARCH}?cve={exploit_query}"
            r = requests.get(exploit_url, timeout=5)
            if r.status_code == 200 and exploit_query in r.text:
                exploit_db_found = True
                evidence.append({"source": "Exploit-DB", "url": exploit_url})
    except Exception:
        pass

    # GitHub search
    try:
        if cve_id:
            gh_pocs = await fetch_github_pocs(cve_id, max_results=5)
            if gh_pocs:
                github_found = True
                for g in gh_pocs:
                    evidence.append(g)
    except Exception:
        pass

    # Reddit posts
    try:
        if cve_id:
            reddit_posts = await fetch_reddit_posts(cve_id, limit=5)
            if reddit_posts:
                reddit_found = True
                for post in reddit_posts:
                    evidence.append({
                        "source": "Reddit",
                        "url": post["url"],
                        "permalink": post["permalink"],
                        "score": post["score"],
                        "nbr_comment": post["num_comments"],
                        "title": post["title"],
                        "created_utc": post["created_utc"]
                    })
    except Exception:
        pass

    # KEV presence
    in_kev = bool(kev_map and cve_id in kev_map)

    # Déduplication
    seen = set()
    deduped = []
    for ev in evidence:
        key = (ev.get("source"), ev.get("url"))
        if key not in seen:
            seen.add(key)
            deduped.append(ev)

    # Déterminer exploit_public
    exploit_public = in_kev or exploit_db_found or github_found or reddit_found

    return {"exploit_public": exploit_public, "evidence": deduped}

# --- Fonctions utilitaires ---
def compute_confidence_level(cve_dict: dict) -> str:
    """Détermine le niveau de confiance de l'exploitation"""
    kev = cve_dict.get("isExploited", False)
    epss = cve_dict.get("epss_score", 0) or 0
    exploit_public = cve_dict.get("exploit_public", False)

    if kev or (exploit_public and epss > 0.6):
        return "High"
    elif epss > 0.3:
        return "Medium"
    elif epss > 0.1:
        return "Low"
    return "Unknown"

def compute_actively_exploited(cve_dict: dict) -> bool:
    """Détermine si le CVE est activement exploité"""
    is_exploited = cve_dict.get("isExploited", False)
    epss_score = cve_dict.get("epss_score") or 0
    return is_exploited and epss_score > 0.6

def generate_vulnerability_profile(cve_dict: dict) -> dict:
    """Génère un titre et description dynamiques pour un CVE"""
    score_field = cve_dict.get("score") or []
    cvss_score = None
    cvss_severity = None
    try:
        cvss_score = float(score_field[1]) if len(score_field) > 1 else None
        cvss_severity = str(score_field[2]).capitalize() if len(score_field) > 2 and score_field[2] else None
    except Exception:
        cvss_score = None
        cvss_severity = None

    is_kev = bool(cve_dict.get("isExploited"))
    actively = bool(cve_dict.get("activelyExploited"))
    epss = cve_dict.get("epss_score") or 0
    exploit_public = cve_dict.get("exploit_public") is True
    product_name = cve_dict.get("product")

    # Déterminer le titre
    if is_kev and (cvss_score and cvss_score >= 9 or cvss_severity == "Critical"):
        title = "⭐ Critical — KEV Listed & Actively Exploited"
    elif is_kev:
        title = "🚨 KEV Listed Vulnerability"
    elif actively and (cvss_score and cvss_score >= 9):
        title = "💥 Actively Exploited — Critical"
    elif actively:
        title = "⚠️ Actively Exploited"
    else:
        if cvss_score is not None:
            if cvss_score >= 9:
                title = "⭐ Critical Vulnerability"
            elif cvss_score >= 7:
                title = "🔴 High Severity Vulnerability"
            elif cvss_score >= 4:
                title = "🟠 Medium Severity Vulnerability"
            else:
                title = "🟢 Low Severity Vulnerability"
        else:
            title = "ℹ️ Vulnerability (no CVSS score)"

    # Description détaillée
    parts = [f"{title}."]
    if cvss_score is not None:
        parts.append(f"CVSS score: {cvss_score} ({cvss_severity or 'N/A'}).")
    else:
        parts.append("CVSS score: N/A.")
    if epss:
        parts.append(f"EPSS: {epss:.3f} (percentile: {cve_dict.get('epss_percentile')}).")
    else:
        parts.append("EPSS: N/A.")
    if is_kev:
        parts.append("Listed in the CISA KEV catalog (confirmed exploitation).")
    if exploit_public:
        parts.append("Public exploit available.")
    if actively and not is_kev:
        parts.append("Indicators suggest active exploitation in the wild.")
    if product_name:
        parts.append(f"Affected product: {product_name}.")

    # Tags
    tags = []
    if product_name:
        tags.append("🏢 Critical Infrastructure")
    if is_kev:
        tags.append("🚨 CISA KEV Listed")
    if actively:
        tags.append("💥 Active Exploitation")
    if exploit_public:
        tags.append("🧩 Public Exploit Available")
    if is_kev and cvss_score and cvss_score >= 9:
        tags.append("📰 Significant Media Coverage")
    if cvss_score is not None:
        if cvss_score >= 9:
            tags.append("⭐ Critical Severity")
        elif cvss_score >= 7:
            tags.append("🔴 High Severity")
        elif cvss_score >= 4:
            tags.append("🟠 Medium Severity")
        else:
            tags.append("🟢 Low Severity")

    description = " ".join(parts)

    # Score synthétique
    synth = 0
    if cvss_score is not None:
        synth += min(10, cvss_score) * 7
    synth += min(1, epss) * 20
    if is_kev:
        synth += 20
    if exploit_public:
        synth += 10
    synth_score = min(100, round(synth))

    return {
        "title": title,
        "description": description,
        "tags": tags,
        "synth_score": synth_score
    }

# --- Cache descriptions avec Redis ---
@simple_cached(ttl=3600)
async def fetch_cve_description(cve_id: str) -> str:
    """Récupérer la description d'un CVE avec cache Redis"""
    try:
        results = searchCVE(cveId=cve_id, key=API_KEY)
        if not results:
            return f"No description found for {cve_id}"

        cve = results[0]
        descriptions = getattr(cve, "descriptions", [])
        if descriptions:
            desc_text = getattr(descriptions[0], "value", None) or cve_id
        else:
            desc_text = cve_id

        return desc_text
    except Exception as e:
        print(f"⚠️ Erreur récupération description pour {cve_id}: {e}")
        return f"Error retrieving description for {cve_id}: {e}"

# --- Transformation CVE ---
async def cve_to_dict_full(cve,kev_map: dict = None):
    """Transforme un objet CVE en dictionnaire enrichi"""
    if hasattr(cve, "getvars"):
        cve.getvars()

    cve_dict = {
        "id": getattr(cve, "id", None),
        "sourceIdentifier": getattr(cve, "sourceIdentifier", None),
        "url": getattr(cve, "url", None),
        "published": getattr(cve, "published", None),
        "lastModified": getattr(cve, "lastModified", None),
        "vulnStatus": getattr(cve, "vulnStatus", None),
        "descriptions": [
            {"lang": d.lang, "value": d.value}
            for d in getattr(cve, "descriptions", [])
        ],
        "references": [
            {"url": getattr(r, "url", None), "tags": getattr(r, "tags", [])}
            for r in getattr(cve, "references", [])
        ],
        "cwe": getattr(cve, "cwe", []),
        "cpe": getattr(cve, "cpe", []),

      
        "v31vector": getattr(cve, "v31vector", None),
        "v30vector": getattr(cve, "v30vector", None),
        "v2vector": getattr(cve, "v2vector", None),

        "v31exploitability": getattr(cve, "v31exploitability", None),
        "v30exploitability": getattr(cve, "v30exploitability", None),
        "v2exploitability": getattr(cve, "v2exploitability", None),

        "v31impactScore": getattr(cve, "v31impactScore", None),
        "v30impactScore": getattr(cve, "v30impactScore", None),
        "v2impactScore": getattr(cve, "v2impactScore", None),

        "score": getattr(cve, "score", []), #ici score =["V31",7.5,"HIGH"] ca contient deja le metrics(v2,v30,v31), leur score et le severity

        "v31attackVector": getattr(cve, "v31attackVector", None),
        "v30attackVector": getattr(cve, "v30attackVector", None),
        "v2accessVector": getattr(cve, "v2accessVector", None),

        "v31attackComplexity": getattr(cve, "v31attackComplexity", None),
        "v30attackComplexity": getattr(cve, "v30attackComplexity", None),
        "v2accessComplexity": getattr(cve, "v2accessComplexity", None),

        #"v31privilegesRequired": getattr(cve, "v31privilegesRequired", None),
        #"v30privilegesRequired": getattr(cve, "v30privilegesRequired", None),
        ##"v31userInteraction": getattr(cve, "v31userInteraction", None),
       # "v30userInteraction": getattr(cve, "v30userInteraction", None),

        #"v31scope": getattr(cve, "v31scope", None),
       # "v30scope": getattr(cve, "v30scope", None),

        "v31confidentialityImpact": getattr(cve, "v31confidentialityImpact", None),
        "v30confidentialityImpact": getattr(cve, "v30confidentialityImpact", None),
        "v2confidentialityImpact": getattr(cve, "v2confidentialityImpact", None),

       
        "v31integrityImpact": getattr(cve, "v31integrityImpact", None),
        "v30integrityImpact": getattr(cve, "v30integrityImpact", None),
        "v2integrityImpact": getattr(cve, "v2integrityImpact", None),

        "v31availabilityImpact": getattr(cve, "v31availabilityImpact", None),
        "v30availabilityImpact": getattr(cve, "v30availabilityImpact", None),
        "v2availabilityImpact": getattr(cve, "v2availabilityImpact", None),
    }

    # Récupérer KEV_DATA une seule fois si non fourni
    if kev_map is None:
        kev_data = await fetch_kev_catalog()
        kev_map = {v["cveID"]: v for v in kev_data.get("vulnerabilities", [])}
    
    kev_info = kev_map.get(cve_dict["id"])
    if kev_info:
        cve_dict.update({
            "isExploited": True,
            "vendorProject": kev_info.get("vendorProject"),
            "product": kev_info.get("product"),
            "vulnerabilityName": kev_info.get("vulnerabilityName"),
            "exploitAdd": kev_info.get("dateAdded"),
            "actionDue": kev_info.get("dueDate"),
            "requiredAction": kev_info.get("requiredAction"),
            "kevShortDescription": kev_info.get("shortDescription"),
            "knownRansomwareCampaignUse": kev_info.get("knownRansomwareCampaignUse"),
        })
    else:
        cve_dict.update({
            "isExploited": False,
            "vendorProject": None,
            "product": None,
            "vulnerabilityName": None,
            "exploitAdd": None,
            "actionDue": None,
            "requiredAction": None,
            "kevShortDescription": None,
            "knownRansomwareCampaignUse": None,
        })

    # EPSS
    epss_data = await get_epss_data_safe(cve_dict["id"])
    cve_dict.update(epss_data)

    # Exploit public
    exploit_info = await detect_public_exploit(cve, kev_map)
    cve_dict.update(exploit_info)

    # Confidence level
    confidence = compute_confidence_level(cve_dict)
    cve_dict["confidenceLevel"] = confidence

    # Actively exploited
    cve_dict["activelyExploited"] = compute_actively_exploited(cve_dict)

    # Profile
    profile = generate_vulnerability_profile(cve_dict)
    cve_dict["profileTitle"] = profile["title"]
    cve_dict["profileDescription"] = profile["description"]
    cve_dict["profileTags"] = profile["tags"]
    cve_dict["profileSynthScore"] = profile["synth_score"]

    return cve_dict


# --- Endpoints principaux ---
@app.get("/cves", summary="Récupérer les CVE récents")
@simple_cached(ttl=3600)
async def get_cves(
    limit: int = Query(5, description="Nombre maximum de CVE à retourner", ge=1, le=2000),
    days: int = Query(DEFAULT_DAYS, description="Nombre de jours à couvrir", ge=1, le=365)
):
    """
    Récupère les CVE publiés récemment avec leurs métadonnées enrichies.
    
    - **limit**: Nombre de CVE à retourner (1-2000)
    - **days**: Période en jours à couvrir (1-365)
    """
    start = datetime.now(timezone.utc) - timedelta(days=days)
    end = datetime.now(timezone.utc)

    results = searchCVE(pubStartDate=start, pubEndDate=end, key=API_KEY, limit=limit)
    cves_output = [await cve_to_dict_full(cve) for cve in results]

    return {
        "total": len(cves_output),
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "cves": cves_output
    }



# --- Nouvel endpoint pour les CVE récents avec cache ---
@app.get("/cves/recent", summary="CVE récents avec cache optimisé")
@simple_cached(ttl=3600)
async def get_recent_cves(
    limit: int = Query(2000, description="Nombre maximum de CVE à retourner", ge=1, le=2000),
    days: int = Query(30, description="Nombre de jours à couvrir", ge=1, le=365)
):
    """
    Récupère les CVE publiés récemment avec système de cache avancé.
    
    - **limit**: Nombre de CVE à retourner (1-2000, défaut: 2000)
    - **days**: Période en jours à couvrir (1-365, défaut: 30)
    
    ⚡ Les résultats sont mis en cache pour des performances optimales.
    🔄 Préchargement automatique des CVE des 30 derniers jours au démarrage.
    """
    try:
        return await fetch_recent_cves_with_cache(limit, days)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur critique dans /cves/recent: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {e}")



#----------------search advanced---------------
@app.get("/cves/search", summary="Recherche avancée de CVE")
@simple_cached(ttl=1800)
async def search_cves(
    page: int = Query(1, description="Numéro de page", ge=1),
    limit: int = Query(50, description="Nombre d'éléments par page", ge=1, le=500),
    start_date: str = Query(None, description="Date de début (YYYY-MM-DD)"),
    end_date: str = Query(None, description="Date de fin (YYYY-MM-DD)"),
    keyword: str = Query(None, description="Recherche texte dans les descriptions"),
    severity: str = Query(None, description="Filtrer par sévérité CVSS", enum=["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    source: str = Query(None, description="Source identifier"),
    has_kev: bool = Query(None, description="Filtrer les CVE présents dans KEV"),
    has_exploit: bool = Query(None, description="Filtrer les CVE avec exploit public")
):
    """
    Recherche avancée de CVE avec pagination et filtres optimisés.
    """
    try:
        # Validation de la plage de dates
        start_dt, end_dt = await validate_and_parse_dates(start_date, end_date)
        
        # Construction des paramètres de recherche nvdlib
        search_params = {
            "key": API_KEY,
            "limit": limit
        }
        
        # Ajout des paramètres conditionnels nvdlib
        if start_dt:
            search_params["pubStartDate"] = start_dt
        if end_dt:
            search_params["pubEndDate"] = end_dt
        if keyword:
            search_params["keywordSearch"] = keyword
        if source:
            search_params["sourceIdentifier"] = source

        print(f"🔍 Recherche CVE avec params: { {k: v for k, v in search_params.items() if k != 'key'} }")

        # Exécution de la recherche
        results = await execute_nvdlib_search(search_params, limit)
        
        if not results:
            return await build_empty_response(page, limit, {
                "start_date": start_date,
                "end_date": end_date,
                "keyword": keyword,
                "severity": severity,
                "source": source,
                "has_kev": has_kev,
                "has_exploit": has_exploit
            })

        # Transformation des résultats
        cves_output = await transform_cves_with_optimization(results)
        
        # Application des filtres post-traitement
        filtered_cves = await apply_post_filters(cves_output, severity, has_kev, has_exploit)
        
        # Pagination
        paginated_results, total_count = await paginate_results(filtered_cves, page, limit)
        
        return await build_success_response(
            paginated_results, total_count, page, limit, {
                "start_date": start_date,
                "end_date": end_date,
                "keyword": keyword,
                "severity": severity,
                "source": source,
                "has_kev": has_kev,
                "has_exploit": has_exploit
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur recherche CVE: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recherche: {e}")

async def validate_and_parse_dates(start_date: str, end_date: str) -> tuple:
    """Valide et parse les dates pour nvdlib"""
    start_dt = None
    end_dt = None
    
    if start_date:
        try:
            start_dt = f"{start_date} 00:00"
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date de début invalide. Utilisez YYYY-MM-DD")
    
    if end_date:
        try:
            end_dt = f"{end_date} 00:00"
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date de fin invalide. Utilisez YYYY-MM-DD")
    
    if start_date and end_date:
        start_obj = datetime.strptime(start_date, "%Y-%m-%d")
        end_obj = datetime.strptime(end_date, "%Y-%m-%d")
        
        if start_obj > end_obj:
            raise HTTPException(status_code=400, detail="La date de début doit être avant la date de fin")
        if (end_obj - start_obj).days > 120:
            raise HTTPException(status_code=400, detail="La plage de dates ne peut pas dépasser 120 jours")
    
    return start_dt, end_dt

async def execute_nvdlib_search(params: dict, limit: int):
    """Exécute la recherche avec nvdlib"""
    try:
        if limit > 100:
            print("🔍 Utilisation de searchCVE_V2 (recherche volumineuse)")
            results_generator = searchCVE_V2(**params)
            
            results = []
            for i, cve in enumerate(results_generator):
                if i >= limit:
                    break
                results.append(cve)
                if i % 100 == 0:
                    print(f"🔍 {i+1} CVE récupérés...")
            return results
        else:
            print("🔍 Utilisation de searchCVE (recherche standard)")
            return searchCVE(**params)
            
    except Exception as e:
        print(f"❌ Erreur lors de la recherche nvdlib: {e}")
        if "rate limit" in str(e).lower():
            raise HTTPException(status_code=429, detail="Limite de taux API NVD atteinte. Réessayez plus tard.")
        raise

async def transform_cves_with_optimization(cves) -> list:
    """Transforme les CVE avec optimisation du cache KEV"""
    if not cves:
        return []
    
    print(f"🔄 Transformation de {len(cves)} CVE...")
    
    kev_data = await fetch_kev_catalog()
    kev_map = {v["cveID"]: v for v in kev_data.get("vulnerabilities", [])}
    
    cves_output = []
    for i, cve in enumerate(cves):
        try:
            cve_data = await cve_to_dict_full(cve, kev_map)
            cves_output.append(cve_data)
        except Exception as e:
            cve_id = getattr(cve, 'id', 'unknown')
            print(f"⚠️ Erreur transformation CVE {cve_id}: {e}")
            continue
        
        if (i + 1) % 50 == 0:
            print(f"🔄 {i+1}/{len(cves)} CVE transformés...")
    
    print(f"✅ Transformation terminée: {len(cves_output)} CVE traités avec succès")
    return cves_output

async def apply_post_filters(cves: list, severity: str, has_kev: bool, has_exploit: bool) -> list:
    """Applique les filtres post-traitement"""
    if not cves:
        return []
    
    filtered = cves
    
    # Filtre par sévérité (utilise l'attribut score)
    if severity:
        filtered = [cve for cve in filtered if matches_severity(cve, severity)]
        print(f"🔍 Filtre sévérité ({severity}): {len(filtered)} CVE après filtrage")
    
    # Filtre KEV
    if has_kev is not None:
        filtered = [cve for cve in filtered if cve.get("isExploited") == has_kev]
        print(f"🔍 Filtre KEV ({has_kev}): {len(filtered)} CVE après filtrage")
    
    # Filtre exploit public
    if has_exploit is not None:
        filtered = [cve for cve in filtered if cve.get("exploit_public") == has_exploit]
        print(f"🔍 Filtre exploit ({has_exploit}): {len(filtered)} CVE après filtrage")
    
    return filtered

def matches_severity(cve: dict, target_severity: str) -> bool:
    """
    Vérifie si un CVE correspond à la sévérité demandée en utilisant l'attribut score.
    L'attribut score est sous forme: ["V31", 7.5, "HIGH"]
    """
    score_data = cve.get("score", [])
    
    if not score_data or len(score_data) < 3:
        return False
    
    cve_severity = score_data[2]
    
    if not isinstance(cve_severity, str):
        return False
    
    target = target_severity.upper()
    cve_sev = cve_severity.upper()
    
    # Logique de matching inclusive
    if target == "CRITICAL":
        return cve_sev == "CRITICAL"
    elif target == "HIGH":
        return cve_sev in ["HIGH", "CRITICAL"]
    elif target == "MEDIUM":
        return cve_sev in ["MEDIUM", "HIGH", "CRITICAL"]
    elif target == "LOW":
        return cve_sev in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    
    return cve_sev == target


async def paginate_results(cves: list, page: int, limit: int) -> tuple:
    """Applique la pagination aux résultats"""
    total = len(cves)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    if start_idx >= total:
        return [], total
    
    paginated = cves[start_idx:end_idx]
    print(f"📄 Pagination: page {page}, résultats {start_idx+1}-{min(end_idx, total)} sur {total}")
    
    return paginated, total

async def build_empty_response(page: int, limit: int, filters: dict) -> dict:
    """Construit une réponse pour aucun résultat"""
    return {
        "status": "empty",
        "page": page,
        "limit": limit,
        "total": 0,
        "count": 0,
        "filters": {k: v for k, v in filters.items() if v is not None},
        "results": [],
        "message": "Aucun CVE trouvé avec les critères de recherche"
    }

async def build_success_response(results: list, total: int, page: int, limit: int, filters: dict) -> dict:
    """Construit une réponse de succès"""
    return {
        "status": "success",
        "page": page,
        "limit": limit,
        "total": total,
        "count": len(results),
        "filters": {k: v for k, v in filters.items() if v is not None},
        "results": results
    }




@app.get("/cve/{cve_id}", summary="Détails complets pour un CVE donné")
@simple_cached(ttl=3600)
async def get_cve_by_id(cve_id: str):
    """
    Recherche et retourne les informations détaillées d'un CVE spécifique.
    
    - **cve_id**: Identifiant du CVE (ex: CVE-2021-44228)
    """
    cve_id_norm = cve_id.strip().upper()
    try:
        results = searchCVE(cveId=cve_id_norm, key=API_KEY)
        if not results:
            raise HTTPException(status_code=404, detail=f"Aucun CVE trouvé pour {cve_id_norm}")

        cve = results[0]
        cve_data = await cve_to_dict_full(cve)

        return {
            "total": 1,
            "cve_id": cve_id_norm,
            "retrievedAt": datetime.now(timezone.utc).isoformat(),
            "cve": cve_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du CVE : {e}")


# --- Endpoints KEV ---
@app.get("/kev/all", summary="Liste complète du catalogue KEV")
@simple_cached(ttl=3600)
async def get_all_kev(force_refresh: bool = Query(False, description="Forcer le rafraîchissement du cache")):
    """
    Retourne la liste complète du catalogue KEV (Known Exploited Vulnerabilities) de la CISA.
    """
    try:
        kev_catalog = await fetch_kev_catalog(force_refresh)
        vulns = kev_catalog.get("vulnerabilities", [])
        
        # Debug logging
        print(f"🔍 Endpoint /kev/all - Vulnérabilités trouvées: {len(vulns)}")
        
        if not vulns:
            print("⚠️ Aucune vulnérabilité dans la réponse KEV")
            # Essayer un refresh forcé
            if not force_refresh:
                print("🔄 Tentative de refresh forcé...")
                kev_catalog = await fetch_kev_catalog(force_refresh=True)
                vulns = kev_catalog.get("vulnerabilities", [])
        
        return {
            "status": "success" if vulns else "empty",
            "count": len(vulns),
            "dateReleased": kev_catalog.get("dateReleased"),
            "catalogVersion": kev_catalog.get("catalogVersion"),
            "vulnerabilities": vulns,
        }
    except Exception as e:
        print(f"❌ Erreur dans /kev/all: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {e}")


#---------------route fixe------------------

@app.get("/kev/recent", summary="KEV ajoutés récemment")
@simple_cached(ttl=3600)
async def get_recent_kevs(days: int = Query(7, description="Nombre de jours", ge=1, le=365)):
    """
    Retourne les vulnérabilités ajoutées récemment au catalogue KEV.
    
    - **days**: Nombre de jours à couvrir (1-365)
    """
    try:
        kev_catalog = await fetch_kev_catalog()
        vulns = kev_catalog.get("vulnerabilities", [])
        
        # Date de coupure
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        print(" alain")
        # Filtrer les vulnérabilités récentes
        recent = []
        for v in vulns:
            if "dateAdded" in v:
                try:
                    date_added = datetime.strptime(v["dateAdded"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                    if date_added >= cutoff:
                        recent.append(v)
                except ValueError as e:
                    print(f"⚠️ Format de date invalide pour {v.get('cveID')}: {v.get('dateAdded')}")

        print(f"🔍 Endpoint /kev/recent - Vulnérabilités récentes: {len(recent)} sur {days} jours")

        return {
            "status": "success" if recent else "empty",
            "days": days,
            "count": len(recent),
            "vulnerabilities": recent,
        }
    
    except Exception as e:
        print(f"❌ Erreur dans /kev/recent: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {e}")


@app.get("/kev/range", summary="KEV entre deux dates")
@simple_cached(ttl=3600)
async def get_kevs_in_range(
    start: str = Query(..., description="Date de début (format: YYYY-MM-DD)"),
    end: str = Query(..., description="Date de fin (format: YYYY-MM-DD)")
):
    """
    Retourne les vulnérabilités KEV ajoutées entre deux dates spécifiques.
    
    - **start**: Date de début (format: AAAA-MM-JJ)
    - **end**: Date de fin (format: AAAA-MM-JJ)
    """
    try:
        # Validation des dates
        try:
            start_dt = datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            end_dt = datetime.strptime(end, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError as e:
            raise HTTPException(status_code=400, detail="Format de date invalide. Utilisez YYYY-MM-DD")
        
        if start_dt > end_dt:
            raise HTTPException(status_code=400, detail="La date de début doit être avant la date de fin")

        kev_catalog = await fetch_kev_catalog()
        vulns = kev_catalog.get("vulnerabilities", [])

        # Filtrer par plage de dates
        filtered = []
        for v in vulns:
            if "dateAdded" in v:
                try:
                    date_added = datetime.strptime(v["dateAdded"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                    if start_dt <= date_added <= end_dt:
                        filtered.append(v)
                except ValueError as e:
                    print(f"⚠️ Format de date invalide pour {v.get('cveID')}: {v.get('dateAdded')}")

        print(f"🔍 Endpoint /kev/range - Vulnérabilités entre {start} et {end}: {len(filtered)}")

        return {
            "status": "success" if filtered else "empty",
            "start": start,
            "end": end,
            "count": len(filtered),
            "vulnerabilities": filtered,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur dans /kev/range: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {e}")

@app.get("/kev/search", summary="Recherche avancée dans KEV")
@simple_cached(ttl=3600)
async def search_kev(
    page: int = Query(1, description="Numéro de page", ge=1),
    limit: int = Query(50, description="Nombre d'éléments par page", ge=1, le=100),
    start: str = Query(None, description="Date de début (YYYY-MM-DD)"),
    end: str = Query(None, description="Date de fin (YYYY-MM-DD)"),
    cve_id: str = Query(None, description="Recherche par CVE ID (partiel ou complet)"),
    vendor: str = Query(None, description="Recherche par vendeur/projet"),
    product: str = Query(None, description="Recherche par produit")
):
    """
    Recherche filtrée et paginée dans le catalogue KEV.
    
    - **page**: Numéro de page (défaut: 1)
    - **limit**: Nombre d'éléments par page (1-100, défaut: 50)
    - **start**: Date de début de la plage
    - **end**: Date de fin de la plage  
    - **cve_id**: Filtre par CVE ID
    - **vendor**: Filtre par vendeur/projet
    - **product**: Filtre par produit
    """
    try:
        kev_catalog = await fetch_kev_catalog()
        vulns = kev_catalog.get("vulnerabilities", [])
        
        print(f"🔍 Endpoint /kev/search - Total vulnérabilités: {len(vulns)}")
        
        # Appliquer les filtres
        filtered_vulns = vulns.copy()
        
        # Filtre par date de début
        if start:
            try:
                start_dt = datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                filtered_vulns = [
                    v for v in filtered_vulns 
                    if "dateAdded" in v and datetime.strptime(v["dateAdded"], "%Y-%m-%d").replace(tzinfo=timezone.utc) >= start_dt
                ]
                print(f"🔍 Après filtre start {start}: {len(filtered_vulns)}")
            except ValueError:
                raise HTTPException(status_code=400, detail="Format de date de début invalide")

        # Filtre par date de fin
        if end:
            try:
                end_dt = datetime.strptime(end, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                filtered_vulns = [
                    v for v in filtered_vulns 
                    if "dateAdded" in v and datetime.strptime(v["dateAdded"], "%Y-%m-%d").replace(tzinfo=timezone.utc) <= end_dt
                ]
                print(f"🔍 Après filtre end {end}: {len(filtered_vulns)}")
            except ValueError:
                raise HTTPException(status_code=400, detail="Format de date de fin invalide")

        # Filtre par CVE ID (recherche insensible à la casse et partielle)
        if cve_id:
            cve_search = cve_id.upper()
            filtered_vulns = [
                v for v in filtered_vulns 
                if cve_search in v.get("cveID", "").upper()
            ]
            print(f"🔍 Après filtre CVE '{cve_id}': {len(filtered_vulns)}")

        # Filtre par vendeur (recherche insensible à la casse et partielle)
        if vendor:
            vendor_search = vendor.upper()
            filtered_vulns = [
                v for v in filtered_vulns 
                if vendor_search in v.get("vendorProject", "").upper()
            ]
            print(f"🔍 Après filtre vendor '{vendor}': {len(filtered_vulns)}")

        # Filtre par produit (recherche insensible à la casse et partielle)
        if product:
            product_search = product.upper()
            filtered_vulns = [
                v for v in filtered_vulns 
                if product_search in v.get("product", "").upper()
            ]
            print(f"🔍 Après filtre product '{product}': {len(filtered_vulns)}")

        # Trier par date d'ajout (plus récent en premier)
        filtered_vulns.sort(
            key=lambda x: x.get("dateAdded", ""), 
            reverse=True
        )

        # Pagination
        total = len(filtered_vulns)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        # Vérifier que l'index de début est valide
        if start_idx >= total:
            paginated = []
        else:
            paginated = filtered_vulns[start_idx:end_idx]

        print(f"🔍 Endpoint /kev/search - Résultats: {len(paginated)}/{total} (page {page})")

        return {
            "status": "success" if paginated else "empty",
            "page": page,
            "limit": limit,
            "total": total,
            "count": len(paginated),
            "filters": {
                "start": start,
                "end": end, 
                "cve_id": cve_id,
                "vendor": vendor,
                "product": product
            },
            "results": paginated,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur dans /kev/search: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {e}")




#----------------route parametre---------------------


@app.get("/kev/{cve_id}", summary="Détails KEV pour un CVE donné")
@simple_cached(ttl=3600)
async def get_kev_by_cve(cve_id: str):
    """
    Vérifie si un CVE est présent dans le catalogue KEV de la CISA.
    """
    try:
        cve_id_norm = cve_id.strip().upper()
        kev_catalog = await fetch_kev_catalog()
        vulns = kev_catalog.get("vulnerabilities", [])
        matches = [v for v in vulns if v.get("cveID", "").upper() == cve_id_norm]

        print(f"🔍 Endpoint /kev/{cve_id} - Corres: {len(matches)}")

        return {
            "status": "success" if matches else "empty",
            "catalogVersion": kev_catalog.get("catalogVersion"),
            "dateReleased": kev_catalog.get("dateReleased"),
            "count": len(matches),
            "matches": matches,
        }
    
    except Exception as e:
        print(f"❌ Erreur dans /kev/{cve_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {e}")





@app.get("/cve/description/{cve_id}", summary="Récupère la description d'un CVE")
@simple_cached(ttl=3600)
async def get_cve_description(cve_id: str):
    """
    Récupère la description textuelle d'un CVE spécifique.
    
    - **cve_id**: Identifiant du CVE (ex: CVE-2021-44228)
    """
    cve_id_norm = cve_id.strip().upper()
    description = await fetch_cve_description(cve_id_norm)
    return {
        "cve_id": cve_id_norm,
        "description": description
    }



#-------------
async def get_cve_stats_from_nvd() -> dict:
    """Récupère le nombre total de CVE depuis l'API NVD"""
    nvd_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    
    try:
        print("🔍 Récupération des statistiques CVE depuis l'API NVD...")
        
        headers = {}
        if API_KEY:
            headers["apiKey"] = API_KEY
        
        # On fait une requête avec startIndex=0 et resultsPerPage=1 juste pour récupérer totalResults
        params = {
            "startIndex": 0,
            "resultsPerPage": 1
        }
        
        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            response = await client.get(nvd_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            stats = {
                "totalResults": data.get("totalResults", 0),
                "resultsPerPage": data.get("resultsPerPage", 0),
            }
            
            print(f"✅ Statistiques CVE récupérées: {stats['totalResults']} CVE au total")
            return stats
            
   
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des stats CVE: {e}")



async def get_kev_stats() -> dict:
    """Récupère les statistiques du catalogue KEV"""
    try:
        print("🔍 Récupération des statistiques KEV...")
        
        kev_catalog = await fetch_kev_catalog()
        vulnerabilities = kev_catalog.get("vulnerabilities", [])
        
      
        stats = {
            "total_vulnerabilities": len(vulnerabilities),
        
        }
        
        print(f"✅ Statistiques KEV récupérées: {stats['total_vulnerabilities']} vulnérabilités")
        return stats
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des stats KEV: {e}")
        return {
            "total_vulnerabilities": 0,
     
        }


#--------------
@app.get("/stats/global", summary="Statistiques globales CVE et KEV")
@simple_cached(ttl=86400)  # Cache de 24 heures
async def get_global_stats():
    """
    Retourne les statistiques globales du nombre total de CVE et KEV.
    Utilise l'API NVD directe pour les CVE et le catalogue KEV pour les vulnérabilités exploitées.
    """
    try:
        print("🔄 Calcul des statistiques globales...")
        
        # Récupérer les stats KEV
        kev_stats = await get_kev_stats()
        
        # Récupérer les stats CVE via API NVD
        cve_stats = await get_cve_stats_from_nvd()
        
        return {
            "status": "success",
            "total_cves": cve_stats.get("totalResults", 0),
            "total_kev": kev_stats.get("total_vulnerabilities", 0),

            
        }
        
    except Exception as e:
        print(f"❌ Erreur lors du calcul des statistiques globales: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des statistiques: {e}")




# --- Statistiques ---
def get_cvss_score(cve: dict) -> float | None:
    """Retourne le score CVSS si disponible, sinon None."""
    score = cve.get("score")
    if score and len(score) > 1:
        try:
            return float(score[1])
        except (TypeError, ValueError):
            return None
    return None

@app.get("/stats/week", summary="Statistiques hebdomadaires")
@simple_cached(ttl=3600)
async def stats_week(days: int = Query(7, description="Nombre de jours", ge=1, le=365)):
    """
    Retourne des statistiques sur les CVE publiés récemment.
    
    - **days**: Nombre de jours à analyser (1-365)
    """
    try:
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=days)
        
        # Récupérer les CVE publiées dans la période
        results = searchCVE(pubStartDate=start, pubEndDate=end, key=API_KEY)
        cves_output = [await cve_to_dict_full(cve) for cve in results]

        total_cve = len(cves_output)
        total_kev = sum(1 for cve in cves_output if cve.get("isExploited"))
        total_actively_exploited = sum(1 for cve in cves_output if cve.get("activelyExploited"))
        total_critical = sum(
            1 for cve in cves_output
            if (score := get_cvss_score(cve)) is not None and score >= 9
        )

        return {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "totalCVE": total_cve,
            "totalKEV": total_kev,
            "totalCritical": total_critical,
            "totalActivelyExploited": total_actively_exploited
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul des statistiques : {e}")

# --- Gestion du cache ---
@app.delete("/cache/clear", summary="Vider le cache")
async def clear_cache(pattern: str = Query("*", description="Pattern des clés à supprimer")):
    """
    Vide le cache Redis selon un pattern.
    
    - **pattern**: Pattern des clés à supprimer (ex: "cve_advisory:*")
    """
    await cache_manager.invalidate_pattern(pattern)
    return {"message": f"Cache cleared for pattern: {pattern}"}

@app.get("/cache/keys", summary="Lister les clés du cache")
async def list_cache_keys(pattern: str = Query("*", description="Pattern des clés à lister")):
    """
    Liste les clés actuellement dans le cache Redis.
    
    - **pattern**: Pattern des clés à lister
    """
    keys = await redis_client.keys(f"cve_advisory:{pattern}")
    return {"keys": keys, "count": len(keys)}

@app.get("/cache/info", summary="Informations sur le cache")
async def cache_info():
    """Retourne des informations sur l'état du cache Redis."""
    try:
        info = await redis_client.client.info()
        return {
            "redis_version": info.get("redis_version"),
            "used_memory": info.get("used_memory_human"),
            "connected_clients": info.get("connected_clients"),
            "keyspace_hits": info.get("keyspace_hits"),
            "keyspace_misses": info.get("keyspace_misses")
        }
    except Exception as e:
        return {"error": str(e)}

# --- Health checks ---
@app.get("/", include_in_schema=False)
async def root():
    """Health check de l'application"""
    return {
        "message": "CVE Advisory API avec Redis",
        "status": "running",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/health", summary="Health check complet")
async def health_check():
    """Health check complet incluant la connexion Redis."""
    redis_status = "connected" if redis_client.client else "disconnected"
    return {
        "status": "healthy",
        "redis": redis_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
