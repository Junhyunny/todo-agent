from dotenv import load_dotenv
from langchain_aws import ChatBedrockConverse
from langchain_core.language_models import BaseChatModel


def get_llm() -> BaseChatModel:
  load_dotenv()
  return ChatBedrockConverse(
    model="apac.amazon.nova-pro-v1:0",
    temperature=1,
    region_name="ap-northeast-1",
  )
