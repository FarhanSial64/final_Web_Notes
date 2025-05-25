from datetime import datetime, date
from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel, Field


class PortfolioItem(BaseModel):
    title: str
    description: Optional[str]
    url: Optional[str]


class User(BaseModel):
    id: Optional[ObjectId] = Field(alias="_id")
    name: Optional[str]
    email: str
    phone: Optional[str]
    password: str
    role: str  # freelancer, client, admin
    isVerified: bool = False
    verificationLevel: str = "basic"  # basic, verified, premium

    # Freelancer
    skills: Optional[List[str]] = []
    portfolio: Optional[List[PortfolioItem]] = []
    profileCompleted: int = 0

    # Client
    preferences: Optional[dict] = {}

    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class Milestone(BaseModel):
    title: str
    dueDate: date
    status: str = "pending"  # pending, completed


class TimeLog(BaseModel):
    date: date
    hours: int


class Project(BaseModel):
    id: Optional[ObjectId] = Field(alias="_id")
    title: str
    description: Optional[str]
    category: Optional[str]
    budget: float
    deadline: date
    isHourly: bool = False
    milestones: Optional[List[Milestone]] = []
    timeLogs: Optional[List[TimeLog]] = []
    clientId: ObjectId
    freelancerId: Optional[ObjectId]
    status: str = "open"  # open, in_progress, completed, cancelled
    progress: int = 0
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class Bid(BaseModel):
    id: Optional[ObjectId] = Field(alias="_id")
    projectId: ObjectId
    freelancerId: ObjectId
    proposal: Optional[str]
    bidAmount: float
    status: str = "pending"  # pending, accepted, rejected
    counterOffer: Optional[float]
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class Review(BaseModel):
    id: Optional[ObjectId] = Field(alias="_id")
    projectId: ObjectId
    clientId: ObjectId
    freelancerId: ObjectId
    rating: int
    comment: Optional[str]
    freelancerResponse: Optional[str]
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None