from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
from enum import Enum
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Núcleo Bets API", description="Sistema de análises de futebol")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
SECRET_KEY = "nucleo_bets_secret_key_2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    WON = "won"
    LOST = "lost"

class AnalysisResult(str, Enum):
    GREEN = "green"
    RED = "red"
    PENDING = "pending"

class BetType(str, Enum):
    HOME_WIN = "1"
    DRAW = "X"
    AWAY_WIN = "2"
    OVER = "over"
    UNDER = "under"
    DOUBLE_CHANCE_1 = "1x"
    DOUBLE_CHANCE_2 = "2x"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_by_admin: bool = False
    expires_at: Optional[datetime] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class AdminUserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole = UserRole.USER
    approved_by_admin: bool = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class ValuableTip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    games: str
    total_odds: str
    stake_suggestion: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ValuableTipCreate(BaseModel):
    title: str
    description: str
    games: str
    total_odds: str
    stake_suggestion: str

class ValuableTipUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    games: Optional[str] = None
    total_odds: Optional[str] = None
    stake_suggestion: Optional[str] = None

class Analysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    match_info: str
    bet_type: BetType
    confidence: float
    detailed_analysis: str
    odds: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    match_date: datetime
    result: AnalysisResult = AnalysisResult.PENDING

class AnalysisCreate(BaseModel):
    title: str
    match_info: str
    bet_type: BetType
    confidence: float
    detailed_analysis: str
    odds: Optional[str] = None
    match_date: datetime

class AnalysisUpdate(BaseModel):
    title: Optional[str] = None
    match_info: Optional[str] = None
    bet_type: Optional[BetType] = None
    confidence: Optional[float] = None
    detailed_analysis: Optional[str] = None
    odds: Optional[str] = None
    match_date: Optional[datetime] = None
    result: Optional[AnalysisResult] = None

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    # Check if user expired (only for non-admin users)
    if user.get("role") != UserRole.ADMIN and user.get("expires_at"):
        expires_at = user["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        if datetime.utcnow() > expires_at:
            # Delete expired user
            await db.users.delete_one({"id": user_id})
            raise HTTPException(status_code=401, detail="Conta expirada")
    
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return current_user

# Background task to clean expired users
async def cleanup_expired_users():
    while True:
        try:
            current_time = datetime.utcnow()
            result = await db.users.delete_many({
                "role": {"$ne": UserRole.ADMIN},
                "expires_at": {"$lt": current_time}
            })
            if result.deleted_count > 0:
                logging.info(f"Cleaned up {result.deleted_count} expired users")
        except Exception as e:
            logging.error(f"Error cleaning expired users: {e}")
        
        # Wait 1 hour before next cleanup
        await asyncio.sleep(3600)

# Routes
@api_router.get("/")
async def root():
    return {"message": "Núcleo Bets API - Sistema de Análises de Futebol"}

# Authentication routes
@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuário ou email já existe")
    
    # Create user with 31-day expiration
    user_dict = user_data.dict()
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["expires_at"] = datetime.utcnow() + timedelta(days=31)
    del user_dict["password"]
    
    user = User(**user_dict)
    await db.users.insert_one(user.dict())
    
    return {"message": "Usuário registrado com sucesso. Aguarde aprovação do administrador."}

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not user["is_active"] or not user["approved_by_admin"]:
        raise HTTPException(status_code=401, detail="Conta não aprovada pelo administrador")
    
    # Check if user expired (only for non-admin users)
    if user.get("role") != UserRole.ADMIN and user.get("expires_at"):
        expires_at = user["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        if datetime.utcnow() > expires_at:
            # Delete expired user
            await db.users.delete_one({"id": user["id"]})
            raise HTTPException(status_code=401, detail="Conta expirada")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    user_data = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"]
    }
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@api_router.put("/auth/change-password")
async def change_password(
    password_data: dict,
    current_user: User = Depends(get_current_user)
):
    current_password = password_data.get("currentPassword")
    new_password = password_data.get("newPassword")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Senhas são obrigatórias")
    
    # Get user from database to verify current password
    user_doc = await db.users.find_one({"id": current_user.id})
    if not user_doc or not verify_password(current_password, user_doc["password_hash"]):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    # Update password
    new_password_hash = hash_password(new_password)
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    return {"message": "Senha alterada com sucesso"}

@api_router.get("/auth/me", response_model=dict)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    }

# Admin routes
@api_router.get("/admin/users", response_model=List[dict])
async def get_users(admin_user: User = Depends(get_admin_user)):
    users = await db.users.find().to_list(1000)
    return [{"id": u["id"], "username": u["username"], "email": u["email"], 
             "role": u["role"], "is_active": u["is_active"], 
             "approved_by_admin": u["approved_by_admin"], "created_at": u["created_at"],
             "expires_at": u.get("expires_at")} for u in users]

@api_router.post("/admin/create-user", response_model=dict)
async def admin_create_user(user_data: AdminUserCreate, admin_user: User = Depends(get_admin_user)):
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuário ou email já existe")
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password_hash"] = hash_password(user_data.password)
    # Set expiration for non-admin users
    if user_data.role != UserRole.ADMIN:
        user_dict["expires_at"] = datetime.utcnow() + timedelta(days=31)
    del user_dict["password"]
    
    user = User(**user_dict)
    await db.users.insert_one(user.dict())
    
    return {"message": "Usuário criado com sucesso pelo administrador."}

@api_router.post("/admin/approve-user/{user_id}")
async def approve_user(user_id: str, admin_user: User = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"approved_by_admin": True, "is_active": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário aprovado com sucesso"}

@api_router.post("/admin/deactivate-user/{user_id}")
async def deactivate_user(user_id: str, admin_user: User = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário desativado com sucesso"}

@api_router.delete("/admin/delete-user/{user_id}")
async def delete_user(user_id: str, admin_user: User = Depends(get_admin_user)):
    # Prevent admin from deleting themselves
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Não é possível deletar sua própria conta")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário deletado com sucesso"}

# Valuable Tips routes
@api_router.post("/admin/valuable-tips", response_model=ValuableTip)
async def create_valuable_tip(tip_data: ValuableTipCreate, admin_user: User = Depends(get_admin_user)):
    tip = ValuableTip(**tip_data.dict())
    await db.valuable_tips.insert_one(tip.dict())
    return tip

@api_router.get("/admin/valuable-tips", response_model=List[ValuableTip])
async def get_admin_valuable_tips(admin_user: User = Depends(get_admin_user)):
    tips = await db.valuable_tips.find().sort("created_at", -1).to_list(1000)
    return [ValuableTip(**tip) for tip in tips]

@api_router.put("/admin/valuable-tips/{tip_id}", response_model=ValuableTip)
async def update_valuable_tip(tip_id: str, tip_update: ValuableTipUpdate, admin_user: User = Depends(get_admin_user)):
    update_dict = {k: v for k, v in tip_update.dict().items() if v is not None}
    
    result = await db.valuable_tips.update_one(
        {"id": tip_id},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Palpite valioso não encontrado")
    
    updated_tip = await db.valuable_tips.find_one({"id": tip_id})
    return ValuableTip(**updated_tip)

@api_router.delete("/admin/valuable-tips/{tip_id}")
async def delete_valuable_tip(tip_id: str, admin_user: User = Depends(get_admin_user)):
    result = await db.valuable_tips.delete_one({"id": tip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Palpite valioso não encontrado")
    return {"message": "Palpite valioso deletado com sucesso"}

# Analysis routes
@api_router.post("/admin/analysis", response_model=Analysis)
async def create_analysis(analysis_data: AnalysisCreate, admin_user: User = Depends(get_admin_user)):
    analysis = Analysis(**analysis_data.dict())
    await db.analyses.insert_one(analysis.dict())
    return analysis

@api_router.get("/admin/analysis", response_model=List[Analysis])
async def get_admin_analyses(admin_user: User = Depends(get_admin_user)):
    analyses = await db.analyses.find().sort("created_at", -1).to_list(1000)
    return [Analysis(**analysis) for analysis in analyses]

@api_router.put("/admin/analysis/{analysis_id}", response_model=Analysis)
async def update_analysis(analysis_id: str, analysis_update: AnalysisUpdate, admin_user: User = Depends(get_admin_user)):
    update_dict = {k: v for k, v in analysis_update.dict().items() if v is not None}
    
    result = await db.analyses.update_one(
        {"id": analysis_id},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    updated_analysis = await db.analyses.find_one({"id": analysis_id})
    return Analysis(**updated_analysis)

@api_router.delete("/admin/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str, admin_user: User = Depends(get_admin_user)):
    result = await db.analyses.delete_one({"id": analysis_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    return {"message": "Análise deletada com sucesso"}

# Public routes (for approved users)
@api_router.get("/valuable-tips", response_model=List[ValuableTip])
async def get_public_valuable_tips(current_user: User = Depends(get_current_user)):
    tips = await db.valuable_tips.find().sort("created_at", -1).limit(10).to_list(10)
    return [ValuableTip(**tip) for tip in tips]

@api_router.get("/analysis", response_model=List[Analysis])
async def get_public_analyses(current_user: User = Depends(get_current_user)):
    analyses = await db.analyses.find().sort("created_at", -1).limit(50).to_list(50)
    return [Analysis(**analysis) for analysis in analyses]

@api_router.get("/stats")
async def get_statistics(current_user: User = Depends(get_current_user)):
    # Analysis stats
    total_analyses = await db.analyses.count_documents({})
    green_analyses = await db.analyses.count_documents({"result": AnalysisResult.GREEN})
    red_analyses = await db.analyses.count_documents({"result": AnalysisResult.RED})
    
    accuracy = (green_analyses / (green_analyses + red_analyses) * 100) if (green_analyses + red_analyses) > 0 else 0
    
    return {
        "total_analyses": total_analyses,
        "green": green_analyses,
        "red": red_analyses,
        "pending": total_analyses - green_analyses - red_analyses,
        "accuracy": round(accuracy, 2)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create admin user if it doesn't exist
    admin_user = await db.users.find_one({"role": UserRole.ADMIN})
    if not admin_user:
        admin_data = {
            "username": "admin",
            "email": "admin@nucleobets.com",
            "password_hash": hash_password("admin123"),
            "role": UserRole.ADMIN,
            "is_active": True,
            "approved_by_admin": True
        }
        admin = User(**admin_data)
        await db.users.insert_one(admin.dict())
        logger.info("Admin user created: username=admin, password=admin123")
    
    # Start cleanup task
    asyncio.create_task(cleanup_expired_users())

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()