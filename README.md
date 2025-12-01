# EN
# LTI - Talent Tracking System

This project is a full-stack application with a React frontend and an Express backend using Prisma as an ORM. The frontend is initiated with Create React App, and the backend is written in TypeScript.

## Directory and File Explanation

- `backend/`: Contains the server-side code written in Node.js.
  - `src/`: Contains the source code for the backend.
    - `index.ts`:  The entry point for the backend server.
  - `prisma/`: Contains the Prisma schema file for ORM.
  - `tsconfig.json`: TypeScript configuration file.
  - `.env`: Contains the environment variables.
- `frontend/`: Contains the client-side code written in React.
  - `src/`: Contains the source code for the frontend.
  - `public/`: Contains static files such as the HTML file and images.
  - `build/`: Contains the production-ready build of the frontend.
- `docker-compose.yml`: Contains the Docker Compose configuration to manage your application's services.
- `README.md`: This file contains information about the project and instructions on how to run it.

## Project Structure

The project is divided into two main directories: `frontend` and `backend`.

### Frontend

The frontend is a React application, and its main files are located in the `src` directory. The `public` directory contains static assets, and the build directory contains the production `build` of the application.

### Backend

El backend es una aplicación Express escrita en TypeScript.
- The `src` directory contains the source code
- The `prisma` directory contains the Prisma schema.

## First steps

To get started with this project, follow these steps:

1. Clone the repo
2. install the dependencias for frontend and backend
```sh
cd frontend
npm install

cd ../backend
npm install
```
3. Copy the environment template located at `backend/env.example` and update
   it with your local paths if needed:
```
cp backend/env.example backend/.env
```
4. Build the backend server
```
cd backend
npm run build
````
5. Run the backend server
```
cd backend
npm run dev 
```

6. In a new terminal window, build the frontend server:
```
cd frontend
npm run build
```
7. Start the frontend server
```
cd frontend
npm start
```

The backend server will be running at http://localhost:3010, and the frontend will be available at http://localhost:3000.

## Docker y PostgreSQL

This project uses Docker to run a PostgreSQL database. Here's how to get it up and running:

Install Docker on your machine if you haven't done so already. Navigate to the
root directory of the project and run one of the following commands depending on
what you need to work on:

- Start only PostgreSQL:
  ```
  docker compose up -d db
  ```
- Start PostgreSQL **and** the backend API (recommended once you're ready to
  integrate):
  ```
  docker compose up -d backend
  ```

The compose file now also mounts `./storage-data` into the backend container and
uses the `FILE_STORAGE_PATH` environment variable so uploaded CVs stay on your
host machine.

Connection details:
 - Host: localhost
 - Port: 5432
 - User: LTIdbUser
 - Password: D1ymf8wyQEGthFR1E9xhCq
 - Database: LTIdb

To stop the Docker containers, run:
```
docker compose down
```
# ES
# LTI - Sistema de Seguimiento de Talento

Este proyecto es una aplicación full-stack con un frontend en React y un backend en Express usando Prisma como ORM. El frontend se inicia con Create React App y el backend está escrito en TypeScript.

## Explicación de Directorios y Archivos

- `backend/`: Contiene el código del lado del servidor escrito en Node.js.
  - `src/`: Contiene el código fuente para el backend.
    - `index.ts`: El punto de entrada para el servidor backend.
  - `prisma/`: Contiene el archivo de esquema de Prisma para ORM.
  - `tsconfig.json`: Archivo de configuración de TypeScript.
  - `.env`: Contiene las variables de entorno.
- `frontend/`: Contiene el código del lado del cliente escrito en React.
  - `src/`: Contiene el código fuente para el frontend.
  - `public/`: Contiene archivos estáticos como el archivo HTML e imágenes.
  - `build/`: Contiene la construcción lista para producción del frontend.
- `docker-compose.yml`: Contiene la configuración de Docker Compose para gestionar los servicios de tu aplicación.
- `README.md`: Este archivo contiene información sobre el proyecto e instrucciones sobre cómo ejecutarlo.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### Frontend

El frontend es una aplicación React y sus archivos principales están ubicados en el directorio `src`. El directorio `public` contiene activos estáticos y el directorio `build` contiene la construcción de producción de la aplicación.

### Backend

El backend es una aplicación Express escrita en TypeScript.
- El directorio `src` contiene el código fuente
- El directorio `prisma` contiene el esquema de Prisma.

## Primeros Pasos

Para comenzar con este proyecto, sigue estos pasos:

1. Clona el repositorio.
2. Instala las dependencias para el frontend y el backend:
```sh
cd frontend
npm install

cd ../backend
npm install
```
3. Copia el archivo `backend/env.example` a `backend/.env` y adapta las rutas a
   tu entorno en caso de ser necesario:
```
cp backend/env.example backend/.env
```
4. Construye el servidor backend:
```
cd backend
npm run build
````
5. Inicia el servidor backend:
```
cd backend
npm run dev 
```

6. En una nueva ventana de terminal, construye el servidor frontend:
```
cd frontend
npm run build
```
7. Inicia el servidor frontend:
```
cd frontend
npm start
```

El servidor backend estará corriendo en http://localhost:3010 y el frontend estará disponible en http://localhost:3000.

## Docker y PostgreSQL

Este proyecto usa Docker para ejecutar una base de datos PostgreSQL. Así es cómo ponerlo en marcha:

Instala Docker en tu máquina si aún no lo has hecho. Desde la raíz del proyecto
puedes usar:

- Solo PostgreSQL:
  ```
  docker compose up -d db
  ```
- PostgreSQL + backend (ideal para pruebas end-to-end):
  ```
  docker compose up -d backend
  ```

El archivo compose monta `./storage-data` dentro del contenedor del backend y
utiliza la variable `FILE_STORAGE_PATH`, por lo que los CV quedan guardados en
tu máquina anfitriona.

Credenciales de conexión:
 - Host: localhost
 - Puerto: 5432
 - Usuario: LTIdbUser
 - Contraseña: D1ymf8wyQEGthFR1E9xhCq
 - Base de datos: LTIdb

Para detener los contenedores:
```
docker compose down
```
