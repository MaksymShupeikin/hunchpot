"""Plain SMTP to our own mail server, no third-party sending service."""
import asyncio
import smtplib
from email.message import EmailMessage

from src.core.config import settings


def _send(to: str, subject: str, text: str, html: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
        if settings.smtp_starttls:
            smtp.starttls()
        if settings.smtp_user:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(msg)


async def send_mail(to: str, subject: str, text: str, html: str) -> None:
    await asyncio.to_thread(_send, to, subject, text, html)


def code_email(code: str, school: str) -> tuple[str, str, str]:
    subject = f"{code} is your Hunchpot code"
    text = f"Your Hunchpot code is {code}.\n\nIt works for 10 minutes and gets you into {school}. If you did not ask for it, ignore this email."
    html = f"""<div style="font-family:system-ui,sans-serif;background:#0e0e12;color:#fff;padding:32px;border-radius:24px;max-width:420px">
<p style="margin:0 0 8px;color:#cfcedb">Your code for {school}</p>
<p style="margin:0 0 20px;font-size:44px;font-weight:800;letter-spacing:8px">{code}</p>
<p style="margin:0;color:#a3a1b6;font-size:14px">It works for 10 minutes. If you did not ask for it, ignore this email.</p></div>"""
    return subject, text, html
