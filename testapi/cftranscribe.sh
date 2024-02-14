set -x

API_TOKEN=8jqpB8mkkVGSbTeZl4wGnsx12xZefAB_y9iaORm3
ACCOUNT_ID=9a90f9962da40fb826ad9666e4ed8ef0

curl https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/openai/whisper \
  -X POST \
  -H "Authorization: Bearer ${API_TOKEN}" \
  --data-binary ./test.mp3

curl https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-2-7b-chat-int8 \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -d '{ "prompt": "say ok to me" }'

curl https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/openai/whisper \
  -X POST \
  -H "Authorization: Bearer ${API_TOKEN}" \
  --data-binary ./goodmorningzh.wav

const inputs = {
      audio: [...new Uint8Array(blob)]
    };



