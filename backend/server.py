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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Núcleo Bets API", description="Sistema de predições de futebol com IA")

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

class PredictionStatus(str, Enum):
    PENDING = "pending"
    WON = "won"
    LOST = "lost"

class MatchResult(str, Enum):
    HOME_WIN = "1"
    DRAW = "X"
    AWAY_WIN = "2"

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

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class AdminTip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_info: str
    prediction: MatchResult
    confidence: float
    reasoning: str
    odds: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    match_date: datetime
    result: Optional[MatchResult] = None
    status: PredictionStatus = PredictionStatus.PENDING

class AdminTipCreate(BaseModel):
    match_info: str
    prediction: MatchResult
    confidence: float
    reasoning: str
    odds: Optional[str] = None
    match_date: datetime

class AdminTipUpdate(BaseModel):
    result: MatchResult
    status: PredictionStatus

class AIPrediction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team: str
    away_team: str
    league: str
    prediction: MatchResult
    confidence: float
    mathematical_analysis: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)
    match_date: datetime
    result: Optional[MatchResult] = None
    status: PredictionStatus = PredictionStatus.PENDING

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
    
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return current_user

# Routes
@api_router.get("/")
async def root():
    return {"message": "Núcleo Bets API - Sistema de Predições de Futebol"}

# Authentication routes
@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuário ou email já existe")
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password_hash"] = hash_password(user_data.password)
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
             "approved_by_admin": u["approved_by_admin"], "created_at": u["created_at"]} for u in users]

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

# Admin Tips routes
@api_router.post("/admin/tips", response_model=AdminTip)
async def create_admin_tip(tip_data: AdminTipCreate, admin_user: User = Depends(get_admin_user)):
    tip = AdminTip(**tip_data.dict())
    await db.admin_tips.insert_one(tip.dict())
    return tip

@api_router.get("/admin/tips", response_model=List[AdminTip])
async def get_admin_tips(admin_user: User = Depends(get_admin_user)):
    tips = await db.admin_tips.find().sort("created_at", -1).to_list(1000)
    return [AdminTip(**tip) for tip in tips]

@api_router.put("/admin/tips/{tip_id}", response_model=AdminTip)
async def update_admin_tip(tip_id: str, tip_update: AdminTipUpdate, admin_user: User = Depends(get_admin_user)):
    result = await db.admin_tips.update_one(
        {"id": tip_id},
        {"$set": tip_update.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Palpite não encontrado")
    
    updated_tip = await db.admin_tips.find_one({"id": tip_id})
    return AdminTip(**updated_tip)

@api_router.delete("/admin/tips/{tip_id}")
async def delete_admin_tip(tip_id: str, admin_user: User = Depends(get_admin_user)):
    result = await db.admin_tips.delete_one({"id": tip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Palpite não encontrado")
    return {"message": "Palpite deletado com sucesso"}

# Public routes (for approved users)
@api_router.get("/tips", response_model=List[AdminTip])
async def get_public_tips(current_user: User = Depends(get_current_user)):
    tips = await db.admin_tips.find().sort("created_at", -1).limit(20).to_list(20)
    return [AdminTip(**tip) for tip in tips]

@api_router.get("/predictions", response_model=List[AIPrediction])
async def get_ai_predictions(current_user: User = Depends(get_current_user)):
    predictions = await db.ai_predictions.find().sort("created_at", -1).limit(10).to_list(10)
    return [AIPrediction(**pred) for pred in predictions]

@api_router.get("/stats")
async def get_statistics(current_user: User = Depends(get_current_user)):
    # Admin tips stats
    total_tips = await db.admin_tips.count_documents({})
    won_tips = await db.admin_tips.count_documents({"status": PredictionStatus.WON})
    lost_tips = await db.admin_tips.count_documents({"status": PredictionStatus.LOST})
    
    admin_accuracy = (won_tips / (won_tips + lost_tips) * 100) if (won_tips + lost_tips) > 0 else 0
    
    # AI predictions stats
    total_ai_predictions = await db.ai_predictions.count_documents({})
    won_ai_predictions = await db.ai_predictions.count_documents({"status": PredictionStatus.WON})
    lost_ai_predictions = await db.ai_predictions.count_documents({"status": PredictionStatus.LOST})
    
    ai_accuracy = (won_ai_predictions / (won_ai_predictions + lost_ai_predictions) * 100) if (won_ai_predictions + lost_ai_predictions) > 0 else 0
    
    return {
        "admin_tips": {
            "total": total_tips,
            "won": won_tips,
            "lost": lost_tips,
            "accuracy": round(admin_accuracy, 2)
        },
        "ai_predictions": {
            "total": total_ai_predictions,
            "won": won_ai_predictions,
            "lost": lost_ai_predictions,
            "accuracy": round(ai_accuracy, 2)
        }
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()