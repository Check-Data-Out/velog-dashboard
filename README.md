# Velog Dashboard Project

> velog dashboard project, ***velog의 모든 게시글, 통계 데이터를 한 눈에 편하게 확인하자!!*** - https://velog-dashboard.kro.kr/

## 1. HOW TO USE

#### https://velog-dashboard.kro.kr/

1. https://velog.io/ 에 접속해서 내 벨로그에 들어간다 (ex - https://velog.io/@qlgks1)

2. 개발자 도구 -> 어플리케이션 -> 쿠키 -> velog에서 `access_token` 값과 `refresh_token` 값을 확인한다!

3. 해당 값을 가지고 login을 한다!

4. ***`데이터 스크레이핑 batch` 가 최대 10분 텀으로 루프를 돕니다.*** 그렇기 때문에 최초 데이터 이니셜라이징에 시간이 소요될 수 있습니다. 

5. 특히 게시글이 많은 경우, 오래된 게시글일 경우, retry로 데이터 스크레이핑을 해도 limit에 걸리는 경우가 있습니다. 이 경우 다음 데이터 스크레이핑 사이클에서 update가 되니, 기다려주시면 너무 감사드립니다. 

6. 영상으로 보기! -> https://youtu.be/Ab8c4kmGhQA

7. post 에 있는 아이콘, ![](https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/20c997/external-eyes-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png) 이미지는 전날 대비 상승, ![](https://img.icons8.com/material-sharp/24/F25081/sleepy-eyes.png) 이미지는 전날 대비 하락 입니다!

8. 최초 로그인 이후, 다시 로그인 시도 하실때 `token issue` 로 고통받으신다면, 우측 하단에 채널톡으로 남겨주시면 제가 핸들링하겠습니다,, (아직 BETA 라 해당 부분은 조금 문제가 있습니다ㅠㅠ)

## 2. token 활용 사항과 사용하는 velog graphQL list

### 1) token 활용

- 입력한 token은 atlas cloud 로 제공되는 mongodb DBMS에 보관됩니다. network ip accesss 부터, auth 까지 모두 제한 환경이니 보안적 이슈는 mongodb사에 있습니다.
- 즉, mongodb cloud가 털리는 이슈까지가 아니라면 token이 탈취될 염려가 없습니다. 
- 만약 그럼에도 불구하고 token 탈취의 의심이 있다면, token의 자체 refresh를 멈추고 폐기에 들어갑니다. 
- ***식별이 가능한 개인정보를 수집하지 않습니다.*** 수집하는 정보는 velog id (email) 이 unique 구분값을 위해 저장되며, 이는 token을 가지고 있는 제 3자에게 유출되지 않습니다.
- 마케팅 용도로 사용하지 않습니다. 만약 이메일 전송이 필요하다고 판단 된다면, 개개인에게 공지성 메일 이후 동의를 받고 진행하게 됩니다. 

### 2) 사용하는 velog graphQL

1. `currentUser`
- velog url를 얻기 위해 사용합니다. `username` 만 가져오며, 그 외 값은 가져오지 않고 누구에게도 제공하지 않습니다.
- 토큰이 필요한 API 입니다.

2. `Posts`
- 해당 유저의 모든 게시글을 가져오기 위해 사용합니다. token이 필요없는 API 이며, 수정, 생성, 삭제 등의 모든 기능은 사용하지 않습니다. 오직 "READ" 만 사용합니다.
- 토큰이 필요하지 않은 API 입니다.

3. `getStats`
- 특정 post uuid 값을 기반으로 통계 데이터를 모두 가져옵니다.
- 토큰이 필요한 API 입니다.

---

## 3. Getting Started

1. 먼저 mongodb atlas connction info가 필요합니다. - https://www.mongodb.com/atlas/database
2. `backend` 디렉토리로 이동합니다.
3. `.env.sample` file을 참조해 `.env` 를 만듭니다.
4. 해당 디렉토리의 root에서 `yarn` 으로 필요한 모든 라이브러리를 설치하고 `yarn start` 로 가동합니다.
5. 이제 static file을 열면 됩니다 -> `nginx > pages > index > index.html` 를 더블클릭으로 브라우저에서 열어주세요!
6. 로그인을 통해 정상적으로 유저 등록이되는지 체크합니다!
7. 이제 `worker` 로 이동해서 poetry를 활요해 필요한 라이브러리를 세팅합니다. - [poetry 간단 사용법](https://velog.io/@qlgks1/python-poetry-%EC%84%A4%EC%B9%98%EB%B6%80%ED%84%B0-project-initializing-%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0)
8. `.env.sample` file을 참조해 `.env` 를 만듭니다.
9. `main.py` 를 러닝해서 데이터 스크레이핑을 확인합니다. 로깅은 console stream과 file stream 모두 존재합니다!
10. `token_refresh.py` 로 저장된 user token을 refresh 해줍니다!


## 4. 참조

- 프로젝트 진행 기록 - velog : 
- [mongodb cloud - atlas](https://www.mongodb.com/atlas/database)
- [poetry 간단 사용법](https://velog.io/@qlgks1/python-poetry-%EC%84%A4%EC%B9%98%EB%B6%80%ED%84%B0-project-initializing-%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0)
- [aiohttp_retry](https://github.com/inyutin/aiohttp_retry)
- 도커라이징 없이, nginx 온프램 배포시 index 페이지를 위해 `ln -s ./index/index.html index.html`