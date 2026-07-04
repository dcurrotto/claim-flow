from __future__ import annotations

from decimal import Decimal
from enum import Enum
from typing import Any, Dict

import boto3
from boto3.dynamodb.conditions import Attr


class EntityType(str, Enum):
    CLAIM = "CLAIM"


class MainEntryRepository:
    def __init__(self, table_name: str = "ClaimFlowMainEntry", region_name: str = "us-east-1"):
        dynamodb = boto3.resource("dynamodb", region_name=region_name)
        self.table = dynamodb.Table(table_name)

    def update_fields(self, pk: str, sk: str, fields: Dict[str, Any]) -> Dict[str, Any]:
        fields = self._normalize_dict(fields)

        update_parts = []
        names = {}
        values = {}

        for i, (field_name, field_value) in enumerate(fields.items()):
            name_key = f"#n{i}"
            value_key = f":v{i}"
            names[name_key] = field_name
            values[value_key] = field_value
            update_parts.append(f"{name_key} = {value_key}")

        response = self.table.update_item(
            Key={"PK": pk, "SK": sk},
            UpdateExpression="SET " + ", ".join(update_parts),
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
            ReturnValues="ALL_NEW",
        )
        return response["Attributes"]

    # ── Claims ────────────────────────────────────────────────────────────────

    def make_claim_pk(self, claim_id: str) -> str:
        return f"CLAIM#{claim_id}"

    def put_claim(self, claim_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        item = {
            "PK": self.make_claim_pk(claim_id),
            "SK": "META",
            "EntityType": EntityType.CLAIM.value,
            "ClaimId": claim_id,
            **self._normalize_dict(data),
        }
        self.table.put_item(Item=item)
        return item

    def get_claim(self, claim_id: str) -> Dict[str, Any] | None:
        response = self.table.get_item(
            Key={"PK": self.make_claim_pk(claim_id), "SK": "META"}
        )
        return response.get("Item")

    def list_claims(self) -> list[Dict[str, Any]]:
        response = self.table.scan(
            FilterExpression=Attr("EntityType").eq(EntityType.CLAIM.value)
        )
        return response.get("Items", [])

    def update_claim(self, claim_id: str, fields: Dict[str, Any]) -> Dict[str, Any]:
        return self.update_fields(
            pk=self.make_claim_pk(claim_id),
            sk="META",
            fields=fields,
        )

    def _normalize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {k: self._normalize(v) for k, v in data.items()}

    def _normalize(self, value: Any) -> Any:
        if isinstance(value, float):
            return Decimal(str(value))
        if isinstance(value, dict):
            return self._normalize_dict(value)
        if isinstance(value, list):
            return [self._normalize(v) for v in value]
        return value
