CREATE DATABASE logistics_db;
USE logistics_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10,2),
  status VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
