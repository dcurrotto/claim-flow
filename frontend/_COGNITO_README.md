
## Cognito App Client settings you must configure in AWS:

Setting	Value
Allowed callback URLs	http://localhost:3000
Allowed sign-out URLs	http://localhost:3000
OAuth grant types	Authorization code grant
OpenID Connect scopes	openid, email, profile
Generate client secret	Off (already set in your template)
For prod, add your real domain to both URL lists alongside localhost.

The VITE_COGNITO_DOMAIN value comes from Cognito → User Pool → App integration → Domain — it looks like your-prefix.auth.us-east-1.amazoncognito.com.

### 1. Deploy the SAM stack
This creates your User Pool and User Pool Client in AWS.

cd infrastructure
sam build
sam deploy --config-env qa
After it completes, go to the AWS Console → CloudFormation → your stack → Resources and note the UserPool and UserPoolClient resource IDs.

### 2. Add a Cognito domain
The Hosted UI requires a domain. In the AWS Console:

Cognito → User Pools → your pool → Branding (side bar) → Domain
Click Actions → Create Cognito domain
Enter a prefix, e.g. your-app-name-qa
Your domain will be: your-app-name-qa.auth.us-east-1.amazoncognito.com

### 3. Configure the App Client
In the Console: Cognito → User Pools → your pool → Applications(side bar) → App clients → your client

Go to the Login pages tab and click Edit

Set these:
Allowed callback URLs	http://localhost:3000
Allowed sign-out URLs	http://localhost:3000
OAuth grant types	✅ Authorization code grant
OpenID Connect scopes	✅ openid ✅ email ✅ profile
Click Save changes.

### 4. Fill in your .env
Open frontend/.env and replace the placeholders:
VITE_COGNITO_DOMAIN=your-app-name-qa.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=<App client ID from the console>
VITE_COGNITO_REDIRECT_URI=http://localhost:3000
VITE_COGNITO_LOGOUT_URI=http://localhost:3000
VITE_COGNITO_REGION=us-east-1
The Client ID is on the App client detail page — it's a string like abc123xyz.

### 5. Run the frontend
cd frontend
npm run dev
Open http://localhost:3000 — you should see the landing page with the Sign in / Sign up button. Clicking it redirects you to the Cognito Hosted UI.

Order matters
The domain and app client config (step 2 & 3) can't currently be automated via your SAM template — they require a manual step in the console.