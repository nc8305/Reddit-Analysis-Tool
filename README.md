# Reddit Monitor: A Parental Insight Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web application designed to help parents understand their children's content consumption and activity on Reddit, promoting safer and more aware online experiences.

## The Problem

The internet is vast, and platforms like Reddit offer incredible communities for learning and connection. However, they also contain mature, complex, or potentially harmful content. For a parent, it can be difficult to balance a child's privacy with the need to ensure their safety. How can you know what content your child is consuming and which communities they are engaging with, without resorting to invasive "spyware"?

## Our Solution

**Reddit Monitor** aims to be the solution. It is not spyware. It is an insight tool.

This application provides a secure, parent-facing dashboard that connects to a child's Reddit account (with their consent) to provide a high-level overview of their activity. The goal is not to read every private message, but to understand the *nature* of the content being consumed.

### System Architecture (Asynchronous Processing)

To ensure high performance and prevent the user interface from freezing while analyzing large amounts of data, the system implements an asynchronous architecture using **Apache Kafka**:

1.  **Trigger:** The frontend sends a scan request to the Backend API.
2.  **Queue:** The API immediately pushes a task message to the Kafka Topic and responds to the user (Non-blocking).
3.  **Process:** A background **Kafka Worker** picks up the task, connects to Reddit API (PRAW) to fetch data, analyzes it, and saves it to the Database.
4.  **Result:** The frontend retrieves the processed data from the Database to display to the user.

## Key Features

* **Secure Parent Dashboard:** A private, password-protected portal for parents.
* **Activity Overview:** A clear and simple view of recent public comments and posts.
* **Real-time Processing:** Powered by Kafka to handle data scanning in the background without system lag.
* **Subreddit Analysis:** See which communities your child is a part of and the general topics of those communities.
* **Consent-Based:** Designed to be used *with* a child's knowledge, fostering trust.

## Tech Stack

This project is built with a modern, scalable web stack:

* **Frontend:** TypeScript (React)
* **Styling:** Tailwind CSS
* **Backend:** Python (FastAPI)
* **Database:** PostgreSQL
* **Message Queue:** Apache Kafka & Zookeeper (for async tasks)
* **API:** Reddit Official API (PRAW)

## Getting Started (for Developers)

This repository contains both the frontend and backend code. Follow these steps to set up the full environment.

### Prerequisites

* Node.js & npm (or yarn)
* Python 3.8+
* Docker & Docker Compose (Required for Kafka infrastructure)
* Git

1. **Clone the Repository**

```bash
git clone [https://github.com/nc8305/Reddit-Analysis-Tool.git](https://github.com/nc8305/Reddit-Analysis-Tool.git)
cd Reddit-Analysis-Tool

2. **Start Infrastructure (Kafka & Database)** 

 ```bash
  # Start Kafka and Zookeeper in the background
 sudo docker compose up -d

 # Verify services are running (Look for 'kafka' and 'zookeeper' with status 'Up')
 sudo docker ps

3. **Setting up backend**

 ```bash
 # Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install required libraries
pip install -r backend/requirement.txt

4. **Setting up the Frontend**
Open a new terminal window and navigate to the frontend directory.
```bash
cd frontend
# Install dependencies
npm install
# Run the development server
npm run dev

## Project Roadmap: The Future Vision

This project is just getting started. Here is our vision for the future:

  * **[ ] Advanced Content Analysis:** Implement sentiment analysis and topic modeling to give parents a "vibe check" of the content (e.g., "overwhelmingly positive," "contains frequent profanity") without needing to read every word.
  * **[ ] Alert System:** Allow parents to set up optional, non-intrusive alerts for keywords or topics they are concerned about.
  * **[ ] Cross-Platform Integration:** Build a framework that could, in the future, be adapted to work with other social media platforms, guided by their specific policies (like those of Facebook/Meta).
  * **[ ] The "Social Awareness" Feature:** Develop our core insights into an optional, privacy-first feature that could be *suggested to platforms themselves*—helping all users, not just parents, understand their own content habits and improve their digital well-being.
  * **[ ] Educational Resources:** Integrate resources for parents on how to talk to their children about difficult online topics, digital citizenship, and mental health.

## How to Contribute

We are actively looking for contributors who share our vision\! Whether you're a frontend developer, a backend engineer, a UI/UX designer, or someone passionate about online safety, we'd love your help.

1.  **Fork** the repository.
2.  Create a new **branch** (`git checkout -b feature/YourAmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/YourAmazingFeature`).
5.  Open a **Pull Request**.

Please read our `CONTRIBUTING.md` file (you'll need to create this) for more detailed guidelines.

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.