# OhanaPal Project

## Overview

OhanaPal is an AI assistant for people with autism. It is a web application that integrates various functionalities including user authentication, audio processing, and interaction with OpenAI's API. This project is built using Node.js, Express, and MongoDB.

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd ohanapal
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the necessary environment variables:

   ```
   MONGODB_URI=<your_mongodb_uri>
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   OPENAI_API_KEY=<your_openai_api_key>
   ```

4. **Run the application:**

   - For development:

     ```bash
     npm run dev
     ```

   - For production:

     ```bash
     npm start
     ```

## File Structure

- **package.json**: Contains project metadata and dependencies.
  ```json:package.json
  startLine: 1
  endLine: 29
  ```

- **.gitignore**: Specifies files and directories to be ignored by Git.
  ```plaintext:.gitignore
  startLine: 1
  endLine: 130
  ```

- **server.js**: Main server file that sets up Express and routes.
  ```javascript:server.js
  startLine: 1
  endLine: 62
  ```

- **src/dashboard/index.html**: Dashboard HTML file (currently empty).
  ```html:src/dashboard/index.html
  startLine: 1
  endLine: 1
  ```

- **src/assessment/index.html**: HTML for the assessment page with interactive elements.
  ```html:src/assessment/index.html
  startLine: 1
  endLine: 68
  ```

- **src/index.html**: Initial loading page with a spinner and redirection logic.
  ```html:src/index.html
  startLine: 1
  endLine: 84
  ```

- **server_utils/tools.js**: Contains utility functions for tool operations.
  ```javascript:server_utils/tools.js
  startLine: 1
  endLine: 52
  ```

- **src/sign-up/index.html**: HTML for the sign-up page with form and Google login.
  ```html:src/sign-up/index.html
  startLine: 1
  endLine: 46
  ```

- **src/sign-up/styles.css**: Styles for the sign-up page.
  ```css:src/sign-up/styles.css
  startLine: 1
  endLine: 164
  ```

- **src/assessment/style.css**: Styles for the assessment page.
  ```css:src/assessment/style.css
  startLine: 1
  endLine: 244
  ```

- **src/assets/ai-response.json**: Placeholder for AI response data (currently empty).
  ```json:src/assets/ai-response.json
  startLine: 0
  endLine: 0
  ```

- **backups/server_backup.js**: Backup of the server file with WebSocket setup.
  ```javascript:backups/server_backup.js
  startLine: 1
  endLine: 133
  ```

- **routes/audio.js**: Handles audio processing and interaction with OpenAI.
  ```javascript:routes/audio.js
  startLine: 1
  endLine: 260
  ```

- **src/client_utils/client_tools.js**: Client-side utility functions for tool operations.
  ```javascript:src/client_utils/client_tools.js
  startLine: 1
  endLine: 50
  ```

- **server_utils/passport-setup.js**: Configures Google OAuth with Passport.js.
  ```javascript:server_utils/passport-setup.js
  startLine: 1
  endLine: 42
  ```

- **backups/main_backup.js**: Backup of the main client-side script with WebSocket setup.
  ```javascript:backups/main_backup.js
  startLine: 1
  endLine: 98
  ```

- **src/assessment/assesment.js**: Client-side script for the assessment page.
  ```javascript:src/assessment/assesment.js
  startLine: 3
  endLine: 243
  ```

- **src/sign-up/signup.js**: Handles sign-up form submission and user creation.
  ```javascript:src/sign-up/signup.js
  startLine: 1
  endLine: 31
  ```

- **models/userModel.js**: Mongoose schema for user data.
  ```javascript:models/userModel.js
  startLine: 1
  endLine: 58
  ```

- **routes/users.js**: API routes for user data retrieval.
  ```javascript:routes/users.js
  startLine: 1
  endLine: 20
  ```

- **src/client_utils/processResponse.js**: Processes server responses on the client side.
  ```javascript:src/client_utils/processResponse.js
  startLine: 1
  endLine: 26
  ```

- **src/client_utils/audio_tools.js**: Utility functions for audio processing.
  ```javascript:src/client_utils/audio_tools.js
  startLine: 1
  endLine: 95
  ```

- **server_utils/db.js**: Database connection setup using Mongoose.
  ```javascript:server_utils/db.js
  startLine: 1
  endLine: 19
  ```

- **routes/auth.js**: Authentication routes using Passport.js.
  ```javascript:routes/auth.js
  startLine: 1
  endLine: 27
  