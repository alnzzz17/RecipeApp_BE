FROM node:18-alpine

# Set direktori kerja di container
WORKDIR /app

# Salin file package.json dan package-lock.json untuk caching build layer
COPY package*.json ./

# Install dependency
RUN npm install

# Salin seluruh source code ke dalam container
COPY . .

# Expose port (disamakan dengan yang digunakan di server)
EXPOSE 5000

# Jalankan aplikasi
CMD ["node", "index.js"]