from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_FILE, extra="ignore")

    app_name: str = "Podorozhnik API"

    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "podorozhnik"
    db_user: str = "podorozhnik"
    db_password: str = "podorozhnik"

    admin_password: str = ""
    admin_token_secret: str = ""
    admin_token_ttl_hours: int = 12

    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    telegram_join_code: str = ""
    telegram_api_base: str = "https://api.telegram.org"

    @property
    def dsn(self) -> str:
        return (
            f"host={self.db_host} port={self.db_port} dbname={self.db_name} "
            f"user={self.db_user} password={self.db_password}"
        )


settings = Settings()
