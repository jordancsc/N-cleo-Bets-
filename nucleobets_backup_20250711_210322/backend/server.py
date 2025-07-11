from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import os
import motor.motor_asyncio
import hashlib
import jwt
import uuid
from bson import ObjectId

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.nucleo_bets

# JWT configuration
SECRET_KEY = "nucleo_bets_secret_key_2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# Models
class UserCreate(BaseModel):
    username: str
    password: str
    is_admin: bool = False

class UserLogin(BaseModel):
    username: str
    password: str

class AnalysisCreate(BaseModel):
    match: str
    league: str
    date: datetime
    prediction_type: str  # Casa, Empate, Fora, Over, Under, Dupla Chance 1, Dupla Chance 2
    odds: float
    description: str
    result: Optional[str] = None  # Green or Red

class AnalysisUpdate(BaseModel):
    match: Optional[str] = None
    league: Optional[str] = None
    date: Optional[datetime] = None
    prediction_type: Optional[str] = None
    odds: Optional[float] = None
    description: Optional[str] = None
    result: Optional[str] = None

class User(BaseModel):
    id: str
    username: str
    is_admin: bool
    created_at: datetime
    expires_at: datetime
    is_active: bool

class Analysis(BaseModel):
    id: str
    match: str
    league: str
    date: datetime
    prediction_type: str
    odds: float
    description: str
    result: Optional[str] = None
    created_at: datetime
    created_by: str

# Utility functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="User account inactive")
    
    # Check if user is expired (only for non-admin users)
    if not user.get("is_admin", False) and datetime.utcnow() > user["expires_at"]:
        await db.users.update_one({"username": username}, {"$set": {"is_active": False}})
        raise HTTPException(status_code=401, detail="User account expired")
    
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Initialize admin user
@app.on_event("startup")
async def startup_event():
    # Create admin user if not exists
    admin_exists = await db.users.find_one({"username": "Ademir"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid.uuid4()),
            "username": "Ademir",
            "password": hash_password("admin123"),
            "is_admin": True,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=36500),  # 100 years
            "is_active": True
        }
        await db.users.insert_one(admin_user)
        print("Admin user created: Ademir / admin123")

# API Routes
@app.post("/api/login")
async def login(user_login: UserLogin):
    user = await db.users.find_one({"username": user_login.username})
    if not user or user["password"] != hash_password(user_login.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_active"]:
        raise HTTPException(status_code=401, detail="Account inactive")
    
    # Check expiration for non-admin users
    if not user["is_admin"] and datetime.utcnow() > user["expires_at"]:
        await db.users.update_one({"username": user_login.username}, {"$set": {"is_active": False}})
        raise HTTPException(status_code=401, detail="Account expired")
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer", "user": {"username": user["username"], "is_admin": user["is_admin"]}}

@app.get("/api/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "is_admin": current_user["is_admin"],
        "created_at": current_user["created_at"],
        "expires_at": current_user["expires_at"]
    }

# User management (Admin only)
@app.post("/api/users")
async def create_user(user_create: UserCreate, admin_user: dict = Depends(get_admin_user)):
    existing_user = await db.users.find_one({"username": user_create.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Regular users expire in 31 days
    expires_at = datetime.utcnow() + timedelta(days=31) if not user_create.is_admin else datetime.utcnow() + timedelta(days=36500)
    
    new_user = {
        "id": str(uuid.uuid4()),
        "username": user_create.username,
        "password": hash_password(user_create.password),
        "is_admin": user_create.is_admin,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "is_active": True
    }
    
    await db.users.insert_one(new_user)
    return {"message": "User created successfully", "user_id": new_user["id"]}

@app.get("/api/users")
async def get_users(admin_user: dict = Depends(get_admin_user)):
    users = []
    async for user in db.users.find({}):
        users.append({
            "id": user["id"],
            "username": user["username"],
            "is_admin": user["is_admin"],
            "created_at": user["created_at"],
            "expires_at": user["expires_at"],
            "is_active": user["is_active"]
        })
    return users

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str, admin_user: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["is_admin"]:
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    await db.users.delete_one({"id": user_id})
    return {"message": "User deleted successfully"}

# Analysis management
@app.post("/api/analyses")
async def create_analysis(analysis: AnalysisCreate, admin_user: dict = Depends(get_admin_user)):
    new_analysis = {
        "id": str(uuid.uuid4()),
        "match": analysis.match,
        "league": analysis.league,
        "date": analysis.date,
        "prediction_type": analysis.prediction_type,
        "odds": analysis.odds,
        "description": analysis.description,
        "result": analysis.result,
        "created_at": datetime.utcnow(),
        "created_by": admin_user["username"]
    }
    
    await db.analyses.insert_one(new_analysis)
    return {"message": "Analysis created successfully", "analysis_id": new_analysis["id"]}

@app.get("/api/analyses")
async def get_analyses(current_user: dict = Depends(get_current_user)):
    analyses = []
    async for analysis in db.analyses.find({}).sort("date", -1):
        analyses.append({
            "id": analysis["id"],
            "match": analysis["match"],
            "league": analysis["league"],
            "date": analysis["date"],
            "prediction_type": analysis["prediction_type"],
            "odds": analysis["odds"],
            "description": analysis["description"],
            "result": analysis["result"],
            "created_at": analysis["created_at"],
            "created_by": analysis["created_by"]
        })
    return analyses

@app.put("/api/analyses/{analysis_id}")
async def update_analysis(analysis_id: str, analysis_update: AnalysisUpdate, admin_user: dict = Depends(get_admin_user)):
    analysis = await db.analyses.find_one({"id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    update_data = {}
    for field, value in analysis_update.dict(exclude_unset=True).items():
        if value is not None:
            update_data[field] = value
    
    if update_data:
        await db.analyses.update_one({"id": analysis_id}, {"$set": update_data})
    
    return {"message": "Analysis updated successfully"}

@app.delete("/api/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str, admin_user: dict = Depends(get_admin_user)):
    analysis = await db.analyses.find_one({"id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    await db.analyses.delete_one({"id": analysis_id})
    return {"message": "Analysis deleted successfully"}

# Background task to clean expired users
@app.on_event("startup")
async def cleanup_expired_users():
    await db.users.update_many(
        {"expires_at": {"$lt": datetime.utcnow()}, "is_admin": False},
        {"$set": {"is_active": False}}
    )

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)