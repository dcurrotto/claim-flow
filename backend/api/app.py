import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
# Try explicit path first, then let dotenv search upward from cwd
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv()


from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from .admin_api import router as admin_router
from .claim_api import router as claim_router, public_router as claim_public_router
from .agent_api import router as agent_router

app = FastAPI(title="claim-flow")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(claim_router)
app.include_router(claim_public_router)
app.include_router(agent_router)

@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/me")
async def me(request: Request):
    aws_event = request.scope.get("aws.event", {})
    request_context = aws_event.get("requestContext", {})
    authorizer = request_context.get("authorizer", {})

    return {
        "message": "authenticated",
        "request_context": request_context,
        "authorizer": authorizer,
    }

handler = Mangum(app, lifespan="off")
