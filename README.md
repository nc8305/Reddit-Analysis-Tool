# Reddit Monitor: A Parental Insight Tool

[](https://opensource.org/licenses/MIT)
[](https://www.google.com/search?q=CONTRIBUTING.md)
[](https://github.com/anatwork14/reddit_monitor)

A web application designed to help parents understand their children's content consumption and activity on Reddit, promoting safer and more aware online experiences.

## The Problem

The internet is vast, and platforms like Reddit offer incredible communities for learning and connection. However, they also contain mature, complex, or potentially harmful content. For a parent, it can be difficult to balance a child's privacy with the need to ensure their safety. How can you know what content your child is consuming and which communities they are engaging with, without resorting to invasive "spyware"?

## Our Solution

**Reddit Monitor** aims to be the solution. It is not spyware. It is an insight tool.

This application provides a secure, parent-facing dashboard that connects to a child's Reddit account (with their consent) to provide a high-level overview of their activity. The goal is not to read every private message, but to understand the *nature* of the content being consumed.

Parents can see:

  * Subreddits their child frequents.
  * Recent public posts and comments.
  * An analysis of topics and communities to help start important conversations.

## Project Philosophy & Social Awareness

This is not just a "monitoring" tool; it's a "conversation starter." We believe the best way to keep children safe online is through trust and open communication.

Our guiding principle is to provide just enough insight for a parent to be *aware*, not to be *invasive*. This project is being built with the future goal of promoting greater social awareness around how teenagers interact with social media. We aim to build features that could one day be suggested to platforms like Facebook or Reddit themselves—features that prioritize user well-being and empower families, not just data collection.

## Key Features (Current & Planned)

  * **Secure Parent Dashboard:** A private, password-protected portal for parents.
  * **Activity Overview:** A clear and simple view of recent public comments and posts.
  * **Subreddit Analysis:** See which communities your child is a part of and the general topics of those communities.
  * **Consent-Based:** Designed to be used *with* a child's knowledge, fostering trust.

## Tech Stack

Based on the repository structure, this project is built with a modern web frontend.

  * **Frontend:** **TypeScript** (likely with a framework like **React, Angular, or Vue**)
  * **Styling:** **Tailwind CSS**
  * **Backend:** **FastAPI**.
  * **API:** **Reddit API**

## Getting Started (for Developers)

This repository contains the **frontend** for the Reddit Monitor application. To get it running locally, you will likely need to set up a separate backend service to handle authentication and Reddit API requests.

### Running the Frontend

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/nc8305/Reddit-Analysis-Tool.git
    cd reddit_monitor/frontend
    ```

2.  **Install dependencies:**
    (This project uses `npm`. You can use `yarn` if you prefer.)

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    This application will require API keys to connect to its backend. Create a `.env` file in the `/frontend` root directory.

    ```
    # Example .env file
    # The URL of your local or deployed backend server
    REACT_APP_API_BASE_URL=http://localhost:5000
    ```

4.  **Run the development server:**

    ```bash
    npm start
    ```

    This will open the app in your browser, usually at `http://localhost:3000`.

**Note:** For full functionality, you will need a backend server running that securely communicates with the Reddit API using OAuth.
### Running the Backend

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/nc8305/Reddit-Analysis-Tool.git
    cd reddit_monitor
    ```
2.  **Install require lib:**
   ```bash
   pip install -r requirement.txt
   ```
3.  **Run back end:**
   ```bash
   python3 -m backend.main
   ```
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



