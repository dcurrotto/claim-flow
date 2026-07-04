import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from repository.main_entry_repository import MainEntryRepository

router = APIRouter(prefix="/claims", tags=["claims"])
public_router = APIRouter(prefix="/public/claims", tags=["claims-public"])

_repo = MainEntryRepository()


class ClaimIntake(BaseModel):
    loss_type: str
    date_of_loss: str
    time_of_loss: Optional[str] = None
    location: str
    description: str
    name: str
    email: str
    phone: Optional[str] = None
    other_parties: Optional[str] = None
    damage_description: str
    estimated_amount: Optional[str] = None
    vehicle_info: Optional[str] = None
    doc_names: List[str] = []


class ClaimStatusUpdate(BaseModel):
    status: Literal["new", "in-progress", "flagged", "closed"]


def _auto_triage(loss_type: str, estimated_amount: Optional[str]) -> str:
    if loss_type == "liability":
        return "siu"
    amount = 0.0
    if estimated_amount:
        try:
            amount = float(estimated_amount.replace("$", "").replace(",", ""))
        except ValueError:
            pass
    if amount > 50000:
        return "siu"
    if loss_type == "auto":
        return "straight-through"
    return "manual-review"


@public_router.post("", response_model=Dict[str, Any])
async def submit_claim(body: ClaimIntake):
    year = datetime.now(timezone.utc).year
    claim_id = f"CLM-{year}-{uuid.uuid4().hex[:8].upper()}"
    data = body.model_dump()
    data["triage"] = _auto_triage(data.get("loss_type", ""), data.get("estimated_amount"))
    data["status"] = "new"
    data["reported_at"] = datetime.now(timezone.utc).isoformat()
    return _repo.put_claim(claim_id, data)


@router.get("", response_model=List[Dict[str, Any]])
async def list_claims():
    claims = _repo.list_claims()
    claims.sort(key=lambda c: c.get("reported_at", ""), reverse=True)
    return claims


@router.get("/{claim_id}", response_model=Dict[str, Any])
async def get_claim(claim_id: str):
    item = _repo.get_claim(claim_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    return item


@router.put("/{claim_id}/status", response_model=Dict[str, Any])
async def update_claim_status(claim_id: str, body: ClaimStatusUpdate):
    if _repo.get_claim(claim_id) is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    return _repo.update_claim(claim_id, {"status": body.status})
