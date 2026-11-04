-- ============================================================
-- Foodie - Food Ordering Website Database Schema (DBMS)
-- Database: foodie_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS foodie_db;
USE foodie_db;

-- ---------- USERS ----------
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    phone         VARCHAR(15)  NOT NULL UNIQUE,
    email         VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- RESTAURANTS ----------
CREATE TABLE restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    cuisine       VARCHAR(200),
    rating        DECIMAL(2,1) DEFAULT 0.0,
    delivery_time INT DEFAULT 30,
    cost_for_two  INT DEFAULT 200,
    image_url     VARCHAR(500),
    offer         VARCHAR(100),
    is_veg        BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_open       BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- MENU CATEGORIES ----------
CREATE TABLE menu_categories (
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name          VARCHAR(80) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- ---------- MENU ITEMS ----------
CREATE TABLE menu_items (
    item_id       INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category_id   INT,
    name          VARCHAR(120) NOT NULL,
    description   VARCHAR(300),
    price         DECIMAL(8,2) NOT NULL,

-- ---------- ADDRESSES ----------
CREATE TABLE addresses (
    address_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    full_name   VARCHAR(100),
    phone       VARCHAR(15),
    line1       VARCHAR(200) NOT NULL,
    city        VARCHAR(80)  NOT NULL,
    pincode     VARCHAR(10)  NOT NULL,
    is_default  BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------- ORDERS ----------
CREATE TABLE orders (
    order_id      VARCHAR(20) PRIMARY KEY,
    user_id       INT,
    restaurant_id INT NOT NULL,
    address_id    INT,
    payment_method ENUM('upi','card','cod') NOT NULL,
    item_total    DECIMAL(10,2) NOT NULL,
    delivery_fee  DECIMAL(8,2)  NOT NULL DEFAULT 40.00,
    taxes         DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
    grand_total   DECIMAL(10,2) NOT NULL,
    status        ENUM('placed','preparing','out_for_delivery','delivered','cancelled') DEFAULT 'placed',
    placed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)       REFERENCES users(user_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (address_id)    REFERENCES addresses(address_id)
);

-- ---------- ORDER ITEMS ----------
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id      VARCHAR(20) NOT NULL,
    item_id       INT NOT NULL,
    item_name     VARCHAR(120) NOT NULL,
    price         DECIMAL(8,2) NOT NULL,
    quantity      INT NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id)  REFERENCES menu_items(item_id)
);

-- ---------- FAVORITES ----------
CREATE TABLE favorites (
    user_id       INT NOT NULL,
    restaurant_id INT NOT NULL,
    PRIMARY KEY (user_id, restaurant_id),
    FOREIGN KEY (user_id)       REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- ---------- COUPONS ----------
CREATE TABLE coupons (
    coupon_code    VARCHAR(20) PRIMARY KEY,
    description    VARCHAR(120),
    discount_type  ENUM('percent','flat') NOT NULL,
    discount_value DECIMAL(8,2) NOT NULL,
    min_order      DECIMAL(8,2) DEFAULT 0,
    max_discount   DECIMAL(8,2),
    is_active      BOOLEAN DEFAULT TRUE
);

    is_veg        BOOLEAN DEFAULT TRUE,
    image_url     VARCHAR(500),
    is_available  BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id)   REFERENCES menu_categories(category_id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO restaurants (restaurant_id,name,cuisine,rating,delivery_time,cost_for_two,image_url,offer,is_veg,is_bestseller) VALUES
(1,'Burger King','Burgers, American, Fast Food',4.3,25,250,'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600','50% OFF up to ₹100',FALSE,TRUE),
(2,"Domino's Pizza",'Pizzas, Italian, Fast Food',4.1,30,300,'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600','Free Delivery',FALSE,FALSE),
(3,'Haldiram''s','North Indian, Sweets, Snacks',4.5,20,200,'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600','20% OFF',TRUE,TRUE),
(4,'Biryani Blues','Biryani, Hyderabadi, Kebabs',4.4,35,350,'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600','Flat ₹100 OFF',FALSE,FALSE),
(5,'Subway','Healthy, Salads, Sandwiches',4.0,22,220,'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600','Buy 1 Get 1',TRUE,FALSE),
(6,'KFC','Chicken, Burgers, Fast Food',3.9,28,320,'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600','30% OFF',FALSE,FALSE),
(7,'Sagar Ratna','South Indian, Dosas',4.6,18,180,'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600','10% OFF',TRUE,TRUE),
(8,'Behrouz Biryani','Biryani, Mughlai, Kebabs',4.2,40,450,'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=600','Free Delivery',FALSE,FALSE),
(9,'Wow! Momo','Momos, Chinese, Tibetan',4.3,24,210,'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600','40% OFF',TRUE,FALSE),
(10,'Pizza Hut','Pizzas, Pastas, Desserts',4.0,32,280,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600','Buy 2 Get 1',FALSE,FALSE),
(11,"McDonald's",'Burgers, Beverages, Desserts',4.1,20,260,'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600','Flat ₹50 OFF',FALSE,FALSE),
(12,'Chai Point','Beverages, Snacks, Breakfast',4.4,15,120,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600','15% OFF',TRUE,FALSE);

INSERT INTO coupons (coupon_code,description,discount_type,discount_value,min_order,max_discount) VALUES
('WELCOME50','50% OFF up to ₹100 on first order','percent',50,0,100),
('FREEDEL','Free delivery on orders above ₹199','flat',40,199,NULL),
('UPI20','20% cashback on UPI payments','percent',20,0,80),
('FLAT125','Flat ₹125 OFF on orders above ₹499','flat',125,499,NULL);

INSERT INTO menu_categories (category_id,restaurant_id,name) VALUES
(1,1,'Burgers'),(2,1,'Sides');

INSERT INTO menu_items (item_id,restaurant_id,category_id,name,description,price,is_veg,image_url) VALUES
(101,1,1,'Whopper','Flame-grilled beef patty with fresh veggies',199.00,FALSE,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'),
(102,1,1,'Chicken Burger','Crispy chicken with mayo',149.00,FALSE,'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300'),
(103,1,1,'Veg Burger','Aloo tikki with fresh lettuce',99.00,TRUE,'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300'),
(104,1,2,'French Fries','Crispy golden fries',89.00,TRUE,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300'),
(105,1,2,'Onion Rings','Crispy onion rings',99.00,TRUE,'https://images.unsplash.com/photo-1639024471283-03518883512d?w=300');

-- ============================================================
-- USEFUL QUERIES
-- ============================================================
-- Top rated restaurants:
-- SELECT name, rating, delivery_time FROM restaurants ORDER BY rating DESC LIMIT 5;
--
-- Order history for a user:
-- SELECT o.order_id, r.name, o.grand_total, o.status, o.placed_at
-- FROM orders o JOIN restaurants r ON o.restaurant_id=r.restaurant_id
-- WHERE o.user_id = 1 ORDER BY o.placed_at DESC;
--
-- Revenue per restaurant:
-- SELECT r.name, COUNT(o.order_id) AS orders, SUM(o.grand_total) AS revenue
-- FROM orders o JOIN restaurants r ON o.restaurant_id=r.restaurant_id
-- GROUP BY r.restaurant_id ORDER BY revenue DESC;

