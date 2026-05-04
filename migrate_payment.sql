ALTER TABLE "order" ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH_ON_DELIVERY';
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID';
CREATE TABLE IF NOT EXISTS payment (
    payment_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES "order"(order_id),
    transaction_id VARCHAR(255),
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    provider_response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
