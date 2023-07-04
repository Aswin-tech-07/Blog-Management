# Blog Management System

This repository contains the source code for a blog management system built with Express.js, MongoDB, Mongoose, and other technologies. It allows you to create, update, and delete blog posts, as well as upload images using Cloudinary.

## Prerequisites

- Node.js (version 18.5.0)
- MongoDB (version 6.2.0)
- Docker (version 23.0.5)

## Getting Started

1. Clone the repository:

   ```shell
   git clone <repository_url>
   ```

2. Install dependencies:

   ```shell
   npm install
   ```

3. Set up the environment variables:

   - Create a `.env` file based on the `.env.example` file.
   - Fill in the necessary environment variables such as database connection details, Cloudinary credentials, etc.

4. Start the development server:

   ```shell
   npm run dev
   ```

5. Open your web browser and navigate to `http://localhost:3000` to access the blog management system.

## Testing

Unit tests are implemented using Mocha and Chai. Run the following command to execute the tests:

```shell
npm test
```

## Linting

ESLint is used for code linting. Run the following command to lint the codebase:

```shell
npm run lint
```

## Production Build

To create a production build, use the following command:

```shell
npm run build
```

The build artifacts will be located in the `dist` directory.

## Docker Containerization

To containerize the application using Docker, follow these steps:

1. Build the Docker image:

   ```shell
   docker build -t blog-management-system .
   ```

2. Run the Docker container:

   ```shell
   docker run -p 3000:3000 -d blog-management-system
   ```

   The application will be accessible at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please follow the guidelines outlined in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to modify the content as per your requirements and add any additional sections you may need.
