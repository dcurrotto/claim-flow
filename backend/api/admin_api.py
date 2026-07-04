import os
from typing import Any, Dict, List

import boto3
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/admin", tags=["admin"])


def _cognito():
    return boto3.client("cognito-idp", region_name=os.environ.get("AWS_REGION", "us-east-1"))


def _pool_id() -> str:
    pool_id = os.environ.get("COGNITO_USER_POOL_ID")
    if not pool_id:
        raise HTTPException(status_code=500, detail="COGNITO_USER_POOL_ID not configured")
    return pool_id


def _usernames_in_group(client, pool_id: str, group_name: str) -> set:
    try:
        resp = client.list_users_in_group(UserPoolId=pool_id, GroupName=group_name)
        return {u["Username"] for u in resp.get("Users", [])}
    except client.exceptions.ResourceNotFoundException:
        return set()


@router.get("/users", response_model=List[Dict[str, Any]])
async def list_users():
    client = _cognito()
    pool_id = _pool_id()

    # Fetch all users
    users_resp = client.list_users(UserPoolId=pool_id)
    users = users_resp.get("Users", [])

    # Fetch group membership in parallel-ish (two calls)
    admin_usernames = _usernames_in_group(client, pool_id, "Admins")
    user_usernames  = _usernames_in_group(client, pool_id, "Users")

    result = []
    for u in users:
        attrs = {a["Name"]: a["Value"] for a in u.get("Attributes", [])}
        username = u["Username"]

        groups = []
        if username in admin_usernames:
            groups.append("Admins")
        if username in user_usernames:
            groups.append("Users")

        created = u.get("UserCreateDate")

        result.append({
            "username": username,
            "email": attrs.get("email", ""),
            "name": attrs.get("name") or attrs.get("email", ""),
            "status": "active" if u.get("Enabled", True) else "inactive",
            "user_status": u.get("UserStatus", ""),
            "created": created.date().isoformat() if created else "",
            "groups": groups,
        })

    return result
