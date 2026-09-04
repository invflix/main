from app.celery.app import celery_app
from app.core.logging import logger

@celery_app.task(name="send_invitation_email")
def send_invitation_email(email: str, invite_link: str, organization_name: str):
    logger.info(f"Sending invitation email to {email} for {organization_name} with link: {invite_link}")
    # Implementation will follow in Phase 3
    return {"status": "sent", "email": email}
