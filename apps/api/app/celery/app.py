from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "medistock_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    imports=[
        "app.celery.tasks.inventory_import",
        "app.celery.tasks.email",
        "app.celery.tasks.expiry",
        "app.celery.tasks.reports"
    ]
)
