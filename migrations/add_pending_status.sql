-- Migration to add 'Pending' status to Customer_Orders
-- Run this SQL against supply_chain_db3 database

-- Add Pending status to Customer_Orders ENUM
ALTER TABLE Customer_Orders 
MODIFY COLUMN status ENUM('Pending','Processing','Out_for_Delivery','Completed','Cancelled') 
DEFAULT 'Pending';

-- Verify the change
DESCRIBE Customer_Orders;
