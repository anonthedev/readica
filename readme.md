# Readica

Readica is a web application for managing and reading your personal library of PDF documents. It allows you to upload your papers, extract metadata, and organize them for easy access.

## Features

-   **PDF Upload:** Upload your PDF files to your personal library.
-   **Metadata Extraction:** Automatically extracts metadata (title, authors, etc.) from your PDFs.
-   **Library Management:** View and organize your uploaded documents.
-   **Status Tracking:** Mark papers with a status like "reading", "read", or "read later".
-   **Filtering and Sorting:** Easily find papers by filtering by status or sorting by different fields.
-   **Secure Storage:** Files are securely stored using Backblaze B2.

## Tech Stack

### Frontend (Client)

-    Next.js, Tailwind, Shadcn, Zustand, Tanstack Query, Lector.

### Backend (Server)

-    Express, Backblaze b2, multer, pdf-lib

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   Node.js (v18 or later)
-   pnpm (or npm/yarn)
-   A Backblaze B2 account for file storage.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/readica.git
    cd readica
    ```

2.  **Setup the Server:**
    ```bash
    cd server
    pnpm install
    ```
    -   Create a `.env` file in the `server` directory and add the following environment variables:
    ```
    BACKBLAZE_KEY_ID=YOUR_BACKBLAZE_KEY_ID
    BACKBLAZE_APP_KEY=YOUR_BACKBLAZE_APP_KEY
    BACKBLAZE_BUCKET_ID=YOUR_BACKBLAZE_BUCKET_ID
    ```

3.  **Setup the Client:**
    ```bash
    cd ../client
    pnpm install
    ```
    -   Create a `.env.local` file in the `client` directory. Please copy the contents from `.env.example` and fill in the necessary values for your environment. This will likely include NextAuth.js secrets and the URL of your backend server.
    ```
    # Example
    NEXT_PUBLIC_SERVER_URL=http://localhost:3001
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd server
    nodemon index.mjs
    ```
    The server will be running on `http://localhost:3001`.

2.  **Start the frontend client:**
    ```bash
    cd client
    pnpm run dev
    ```
    The client will be running on `http://localhost:3000`.

## API Endpoints

The backend server exposes the following REST API endpoints:

-   `POST /upload`: Uploads a PDF file. The file should be sent as `multipart/form-data` with the key `file`. It returns a file ID and extracted metadata.
-   `POST /extract-metadata`: Extracts metadata from a PDF file without uploading it to cloud storage. The file should be sent as `multipart/form-data` with the key `file`.

The Next.js client also has its own API routes under `client/src/app/api/` for handling things like authentication, proxying requests, and interacting with the backend.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please make sure to update tests as appropriate.

## License

This project is licensed under the MIT License.