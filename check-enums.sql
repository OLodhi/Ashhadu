-- Check what ENUM types exist in your database
-- Run this first to see what you have

SELECT 
    t.typname AS enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_role', 'product_status', 'product_visibility', 'stock_status', 'order_status', 'payment_status', 'review_status', 'inventory_movement_type')
GROUP BY t.typname
ORDER BY t.typname;