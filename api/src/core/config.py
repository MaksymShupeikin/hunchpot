from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://hunchpot:hunchpot@localhost:5432/hunchpot"
    seed_demo: bool = True
    secret: str = "dev-only-change-me"  # peppers code and session hashes; set a long random value in production

    question_max: int = 70  # short questions read at a glance and fit the screen

    # money is stored in cents
    min_stake: int = 100
    starting_balance: int = 5000  # demo money for new students; 0 once payments are real

    # sign-in by school email
    session_days: int = 30
    code_minutes: int = 10
    code_attempts: int = 5
    code_resend_seconds: int = 60

    # our own SMTP server: Mailpit in development, our Postfix in production
    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_from: str = "Hunchpot <codes@hunchpot.com>"
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_starttls: bool = False


settings = Settings()
