from decimal import Decimal
from typing import Any, Dict

from strands import Agent, tool
from strands.models import BedrockModel

from repository.main_entry_repository import MainEntryRepository

_MODEL_ID = "us.anthropic.claude-sonnet-4-6"
_REGION = "us-east-1"


def _serialize(obj: Any) -> Any:
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize(v) for v in obj]
    return obj


@tool
def get_claim_details(claim_id: str) -> Dict[str, Any]:
    """
    Retrieve full claim details from the database by claim ID.

    Args:
        claim_id: The claim identifier, e.g. CLM-2026-A3F8B2C1

    Returns:
        All claim fields: loss_type, date_of_loss, description, name, email,
        phone, estimated_amount, triage, status, reported_at.
    """
    repo = MainEntryRepository()
    claim = repo.get_claim(claim_id)
    if claim is None:
        return {"error": f"Claim {claim_id} not found"}
    return _serialize(claim)


@tool
def assess_fraud_indicators(
    loss_type: str,
    estimated_amount: str,
    description: str,
) -> Dict[str, Any]:
    """
    Apply rules-based fraud indicator checks to a claim.

    Args:
        loss_type: Type of loss — auto, property, liability, etc.
        estimated_amount: Dollar amount as a string, e.g. '$12,000' or '15000'
        description: The claimant's incident description

    Returns:
        risk_level (low/medium/high), list of risk_factors, and recommended_path.
    """
    risk_factors = []
    risk_level = "low"

    amount = 0.0
    if estimated_amount:
        try:
            amount = float(estimated_amount.replace("$", "").replace(",", "").strip())
        except (ValueError, AttributeError):
            pass

    if amount > 50_000:
        risk_factors.append(f"High claim amount (${amount:,.0f} exceeds $50k SIU threshold)")
        risk_level = "high"

    if loss_type == "liability":
        risk_factors.append("Liability claims carry elevated fraud exposure")
        if risk_level != "high":
            risk_level = "medium"

    red_flag_terms = ["attorney", "lawyer", "whiplash", "pain and suffering", "settlement"]
    desc_lower = (description or "").lower()
    matched = [t for t in red_flag_terms if t in desc_lower]
    if matched:
        risk_factors.append(f"Fraud-correlated language detected: {', '.join(matched)}")
        if risk_level == "low":
            risk_level = "medium"

    if not risk_factors:
        risk_factors.append("No automated fraud indicators triggered")

    path_map = {"low": "straight-through", "medium": "manual-review", "high": "siu"}

    return {
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "recommended_path": path_map[risk_level],
    }


_SYSTEM_PROMPT = """You are an expert P&C (Property & Casualty) Claims Analyst AI for Claim Flow.
Your role is to help claims adjusters make faster, better-informed decisions.

When given a claim ID, you will:
1. Call get_claim_details to retrieve the full claim record
2. Call assess_fraud_indicators with loss_type, estimated_amount, and description from that record
3. Synthesize a professional adjuster recommendation

Your response must use these exact headings:

**Triage Decision**
State the recommended handling path (Straight-Through Processing, Manual Review, or SIU Referral)
and a one-sentence rationale.

**Risk Assessment**
Summarize what the fraud indicator check found. Note the risk level and any flags.

**Suggested Next Steps**
3-5 numbered, concrete, actionable items for the adjuster.

**Missing Information**
List anything needed to complete the claim, or state "None — package is complete."

Be concise and professional. This is read by an adjuster who needs to act quickly."""


def analyze_claim(claim_id: str) -> str:
    model = BedrockModel(model_id=_MODEL_ID, region_name=_REGION, streaming=False)
    agent = Agent(
        model=model,
        tools=[get_claim_details, assess_fraud_indicators],
        system_prompt=_SYSTEM_PROMPT,
    )
    result = agent(f"Analyze claim {claim_id} and provide a complete adjuster recommendation.")
    return str(result)
