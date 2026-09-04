from app.celery.app import celery_app
from app.core.logging import logger

@celery_app.task(name="check_inventory_expiry")
def check_inventory_expiry():
    logger.info("Checking inventory batches for expiry alerts...")
    # Implementation will follow in Phase 6
    return {"status": "checked"}
