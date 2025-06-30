## デプロイの仕組みについて

### 1. DockerFileを作成

```bash
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/backend/

WORKDIR /app

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port","8080"]
```

### 2. `.dockerignore`を作成

>[!NOTE]
>`docker build`する時に関係ないファイルをビルドしないように

```bash
Dockerfile
docker-compose.yml
.git
.gitignore

.venv/
venv/
env/
__pycache__/
*.pyc
*.pyo
*.pyd

.firebase/
.idea/
.vscode/ 
README.md
```

### 3. `Google-cloud-sdkのインストールおよびgcloudコマンドの設置`

>[!NOTE]
>MacOS対象

```bash
brew install google-cloud-sdk

gcloud auth login

gcloud config set project [PROJECT_ID]

gcloud auth list

gcloud config get-value project

gcloud auth application-default login

gcloud auth application-default login
```

### 4. 必要なクラウドサービスを有効化

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```


### 5. ローカル上で動作確認
>[!NOTE]
>`docker`にビルドしたアプリを確認、こちらビルドの名前は任意なので、今回は`shift-agent-backend`に設定した

```bash
docker build -t shift-agent-backend:local .
```

- ビルド
```bash
docker build -t shift-agent-backend:local .
```

- Docker内のアプリにGCPをアクセス権限を与え

```bash
gcloud auth application-default login

docker run -d --rm --name shift-agent-test \
  -p 8000:8080 \
  -v /Users/jacksenng/.config/gcloud/application_default_credentials.json:/app/credentials.json \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  shift-agent-backend:local
```

- コンテナ起動
```bash
docker run -d --rm --name shift-agent-test -p 8000:8080 shift-agent-backend:local
```

- コンテナ停止
```bash
docker stop shift-agent-test
```

### 6. `GCP`のリポジトリにあげる
>[!NOTE]
> IAMの権限については`Cloud Build Editor`を忘れずに設定　
```bash
gcloud artifacts repositories create shift-agent-repo --repository-format=docker --location=asia-northeast1 --description="Docker repository for shift-agent"
```
### 7. ImageのPushおよびデプロイ
- ImageのPush
```bash
gcloud builds submit --tag asia-northeast1-docker.pkg.dev/[PROJECT_ID]/shift-agent-repo/shift-agent-backend:latest .
```
- デプロイ
>[!NOTE]
> `allow-unauthenticated`こちらの部分は一般開放なので、後々また変える
```bash
gcloud run deploy shift-agent-backend --image asia-northeast1-docker.pkg.dev/[PROJECT_ID]/shift-agent-repo/shift-agent-backend:latest --platform managed --region asia-northeast1 --allow-unauthenticated
```