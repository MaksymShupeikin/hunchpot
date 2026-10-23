import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.core.config import settings
from src.core.database import engine, async_session
from src.models import Base
from src.routers import auth, bets, users
from src.services.seed import seed_demo

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # shortcut: create_all instead of migrations, switch to alembic before the first schema change on real data
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    if settings.seed_demo:
        async with async_session() as db:
            await seed_demo(db)
    yield
    await engine.dispose()


app = FastAPI(title="Hunchpot API", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(bets.router)
app.include_router(users.router)


@app.get("/health")
async def health():
    return {"ok": True}
