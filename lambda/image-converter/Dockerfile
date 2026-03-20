FROM public.ecr.aws/lambda/nodejs:20

# Lambda関数コードとpackage.jsonをコピー
COPY package.json index.mjs ./

# Linux向けにnpm install
RUN npm install --production

# ハンドラー設定
CMD ["index.handler"]
