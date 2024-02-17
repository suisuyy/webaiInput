set -x

export API_TOKEN=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
curl https://api-inference.huggingface.co/models/gpt2 \
        -X POST \
        -d '"say ok "' \
        -H "Authorization: Bearer ${API_TOKEN}"
# [{"generated_text":"Can you please let us know more details about your ids as a subscriber or other related project? Be sure to update your username and password or it will be stolen via email. Our information is only accessible through our website, and the payment support services"}]

echo audio test
curl https://api-inference.huggingface.co/models/openai/whisper-large-v3 \
        -X POST \
        --data-binary '@gmenjp.wav' \
        -H "Authorization: Bearer ${API_TOKEN}"


curl https://api-inference.huggingface.co/models/distil-whisper/distil-large-v2 \
        -X POST \
        --data-binary '@gmenjp.wav' \
        -H "Authorization: Bearer ${API_TOKEN}"

        

