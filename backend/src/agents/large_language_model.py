from dotenv import load_dotenv
from langchain_aws import ChatBedrockConverse
from langchain_core.language_models import BaseChatModel

models = [
  "global.anthropic.claude-sonnet-4-6",
  "global.anthropic.claude-haiku-4-5-20251001-v1:0",
  "apac.amazon.nova-pro-v1:0",
]


def get_llm() -> BaseChatModel:
  load_dotenv()
  return ChatBedrockConverse(
    model=models[1],
    temperature=1,
    region_name="ap-northeast-1",
  )
