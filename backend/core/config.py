from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Service Register"
    PROJECT_VERSION: str = "1.0.0"
    ALLOWED_ORIGINS: list[str] = ["*"]  # Adjust this to your needs

settings = Settings()